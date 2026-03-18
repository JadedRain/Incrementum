import { useEffect, useReducer } from 'react';

interface DateRangeState {
  clickedStart: string;
  clickedEnd: string;
  formattedStart?: string;
  formattedEnd?: string;
  isRestored?: boolean;
}

interface DateRangeAction {
  type: 'SET_START' | 'SET_END' | 'SET_BOTH' | 'RESET' | 'UNDO' | 'CLEAR' | 'UNDO_TO_COMPLETE';
  start?: string;
  end?: string;
  formattedStart?: string;
  formattedEnd?: string;
}

interface UndoableState {
  current: DateRangeState;
  history: DateRangeState[];
}

const initialDateRangeState: DateRangeState = {
  clickedStart: '',
  clickedEnd: '',
};

const undoableReducer = (state: UndoableState, action: DateRangeAction): UndoableState => {
  switch (action.type) {
    case 'SET_START':
      const newStateStart: DateRangeState = {
        clickedStart: action.start || '',
        clickedEnd: '',
        isRestored: false,
      };
      return {
        current: newStateStart,
        history: [...state.history, state.current],
      };

    case 'SET_END':
      const newStateEnd: DateRangeState = {
        clickedStart: state.current.clickedStart,
        clickedEnd: action.end || '',
        isRestored: false,
      };
      return {
        current: newStateEnd,
        history: [...state.history, state.current],
      };

    case 'SET_BOTH':
      const newStateBoth: DateRangeState = {
        clickedStart: action.start || '',
        clickedEnd: action.end || '',
        formattedStart: action.formattedStart,
        formattedEnd: action.formattedEnd,
        isRestored: false,
      };
      return {
        current: newStateBoth,
        history: [...state.history, state.current],
      };

    case 'RESET':
      if (state.history.length > 0) {
        const previousState = state.history[state.history.length - 1];
        return {
          current: previousState,
          history: state.history.slice(0, -1),
        };
      }
      return state;

    case 'UNDO':
      if (state.history.length > 0) {
        const previousState = state.history[state.history.length - 1];
        return {
          current: { ...previousState, isRestored: previousState.clickedStart && previousState.clickedEnd },
          history: state.history.slice(0, -1),
        };
      }
      return state;

    case 'CLEAR':
      return {
        current: { ...initialDateRangeState, isRestored: false },
        history: [],
      };

    case 'UNDO_TO_COMPLETE':
      // If both dates are selected, do a single undo to go back one step
      // (which will either clear the selection or go to a partial state)
      if (state.history.length > 0) {
        const previousState = state.history[state.history.length - 1];
        return {
          current: { ...previousState, isRestored: previousState.clickedStart && previousState.clickedEnd },
          history: state.history.slice(0, -1),
        };
      }
      return state;

    default:
      return state;
  }
};

export const useUndoableDateRange = (onReset?: () => void, onRestoreRange?: (start: string, end: string) => void,) => {
  const [state, dispatch] = useReducer(undoableReducer, {
    current: initialDateRangeState,
    history: [],
  });

  useEffect(() => {
    const handleUndo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        
        // If both dates are selected, go back to the previous complete range
        if (state.current.clickedStart && state.current.clickedEnd) {
          dispatch({ type: 'UNDO_TO_COMPLETE' });
        } else {
          // Otherwise, do regular undo (one step back)
          dispatch({ type: 'UNDO' });
        }
      }
    };

    window.addEventListener('keydown', handleUndo);
    return () => window.removeEventListener('keydown', handleUndo);
  }, [state.current, state.history]);

  // Notify when state is completely cleared
  useEffect(() => {
    if (!state.current.clickedStart && !state.current.clickedEnd && onReset) {
      onReset();
    }
  }, [state.current.clickedStart, state.current.clickedEnd, onReset]);

  // Notify when a previous range is restored
  useEffect(() => {
    if (
      state.current.isRestored &&
      state.current.clickedStart &&
      state.current.clickedEnd &&
      onRestoreRange
    ) {
      onRestoreRange(state.current.clickedStart, state.current.clickedEnd);
    }
  }, [state.current.isRestored, state.current.clickedStart, state.current.clickedEnd, onRestoreRange]);

  return {
    clickedStart: state.current.clickedStart,
    clickedEnd: state.current.clickedEnd,
    setClickedStart: (start: string) => dispatch({ type: 'SET_START', start }),
    setClickedEnd: (end: string) => dispatch({ type: 'SET_END', end }),
    clearDateRange: () => dispatch({ type: 'CLEAR' }),
  };
};
