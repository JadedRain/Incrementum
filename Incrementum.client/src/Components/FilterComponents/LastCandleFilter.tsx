import React, { useMemo, useState, useEffect, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import FilterChip from '../FilterChip';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import '../../styles/LastCandleFilter.css';

const LastCandleFilter: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeLastCandleFilters, setActiveLastCandleFilters] = useState<string[]>([]);
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();
  const optionsBoxRef = useRef<HTMLDivElement>(null);

  const candleOptions = ['hammer', 'hanging_man', 'inverted_hammer'];

  const lastCandleFiltersFromContext = useMemo(() => {
    return Object.values(filterDict)
      .filter((f) => f.operand === 'last_candle')
      .map((f) => (typeof f.value === 'string' ? f.value : String(f.value ?? '')))
      .filter((v) => v.length > 0)
      .sort((a, b) => a.localeCompare(b));
  }, [filterDict]);
  const previousLastCandleFilterCountRef = useRef(lastCandleFiltersFromContext.length);

  // Keep chip UI in sync with context (e.g., when applying shared links)
  useEffect(() => {
    setActiveLastCandleFilters((prev) => {
      const next = lastCandleFiltersFromContext;
      if (prev.length === next.length && prev.every((p, i) => p === next[i])) {
        return prev;
      }
      return next;
    });
  }, [lastCandleFiltersFromContext]);

  // Clear dropdown when filters are reset
  useEffect(() => {
    const currentLastCandleFilterCount = lastCandleFiltersFromContext.length;
    if (previousLastCandleFilterCountRef.current > 0 && currentLastCandleFilterCount === 0) {
      setShowOptions(false);
    }
    previousLastCandleFilterCountRef.current = currentLastCandleFilterCount;
  }, [lastCandleFiltersFromContext]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsBoxRef.current && !optionsBoxRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCandle = (candle: string) => {
    if (!activeLastCandleFilters.includes(candle)) {
      addFilter({
        operator: 'equals',
        operand: 'last_candle',
        filter_type: 'string',
        value: candle,
      });
    }
    setShowOptions(false);
  };

  const removeLastCandleFilter = (candle: string) => {
    const key = `last_candle__equals__${candle}`;
    removeFilter(key);
  };

  return (
    <ExpandableSidebarItem title="Candlestick Pattern" description="The last candle pattern observed for the stock.">
      <div className="mb-4 relative" ref={optionsBoxRef}>
        <label className="block text-sm font-medium mb-2">Candlestick Pattern:</label>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="sidebar-input filter-input-full text-left flex justify-between items-center"
        >
          {activeLastCandleFilters.length > 0 ? `${activeLastCandleFilters.length} selected` : 'Select pattern...'}
          <span className={`transition-transform ${showOptions ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Select from: hammer, hanging_man, inverted_hammer
        </p>

        {showOptions && (
          <div className="candle-options-container">
            {candleOptions.map((candle, index) => (
              <div
                key={index}
                onClick={() => selectCandle(candle)}
                className={`candle-option-item ${activeLastCandleFilters.includes(candle) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={activeLastCandleFilters.includes(candle)}
                  onChange={() => {}}
                  className="mr-2"
                />
                {candle}
              </div>
            ))}
          </div>
        )}

        {activeLastCandleFilters.length > 0 && (
          <div className="filter-chips">
            {activeLastCandleFilters.map(candle => (
              <FilterChip
                key={candle}
                label={candle}
                onRemove={() => removeLastCandleFilter(candle)}
              />
            ))}
          </div>
        )}
      </div>
    </ExpandableSidebarItem>
  );
};

export default LastCandleFilter;
