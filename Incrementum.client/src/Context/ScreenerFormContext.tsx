import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ScreenerFormState {
  screenerName: string;
  saving: boolean;
  error: string;
  success: string;
}

interface ScreenerFormActions {
  setScreenerName: (name: string) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  clearMessages: () => void;
  resetForm: () => void;
  saveCustomScreener: (apiKey: string) => Promise<void>;
}

interface ScreenerFormContextValue extends ScreenerFormState, ScreenerFormActions {}

const ScreenerFormContext = createContext<ScreenerFormContextValue | undefined>(undefined);

interface ScreenerFormProviderProps {
  children: ReactNode;
}

export const ScreenerFormProvider: React.FC<ScreenerFormProviderProps> = ({ children }) => {
  const [screenerName, setScreenerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setScreenerName('');
    setSaving(false);
    setError('');
    setSuccess('');
  };

  const saveCustomScreener = async (apiKey: string) => {
    if (!screenerName.trim()) {
      setError('Please enter a screener name');
      return;
    }

    if (!apiKey) {
      setError('You must be logged in to save a screener');
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      const response = await fetch('http://localhost:8000/custom-screeners/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': apiKey,
        },
        body: JSON.stringify({
          name: screenerName.trim(),
          numeric_filters: [],
          categorical_filters: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Screener "${screenerName}" saved successfully!`);
        resetForm();
        console.log('Screener saved:', data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save screener');
      }
    } catch (error) {
      console.error('Error saving screener:', error);
      setError('Failed to save screener. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const value: ScreenerFormContextValue = {
    // State
    screenerName,
    saving,
    error,
    success,
    // Actions
    setScreenerName,
    setSaving,
    setError,
    setSuccess,
    clearMessages,
    resetForm,
    saveCustomScreener
  };

  return (
    <ScreenerFormContext.Provider value={value}>
      {children}
    </ScreenerFormContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useScreenerForm = (): ScreenerFormContextValue => {
  const context = useContext(ScreenerFormContext);
  if (context === undefined) {
    throw new Error('useScreenerForm must be used within a ScreenerFormProvider');
  }
  return context;
};