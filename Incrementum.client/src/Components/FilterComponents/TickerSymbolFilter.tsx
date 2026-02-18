import React, { useState } from 'react';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import FilterChip from '../FilterChip';

const TickerSymbolFilter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTickerFilters, setActiveTickerFilters] = useState<string[]>([]);
  const { addFilter, removeFilter } = useDatabaseScreenerContext();

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter at least one ticker symbol.');
      return;
    }
    const symbols = trimmed
      .split(/[\s,]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
    if (symbols.length === 0) {
      setError('No valid symbols found.');
      return;
    }
    symbols.forEach(symbol => {
      if (!activeTickerFilters.includes(symbol)) {
        addFilter({
          operator: 'equals',
          operand: 'ticker',
          filter_type: 'categoric',
          value: symbol,
        });
        setActiveTickerFilters(prev => [...prev, symbol]);
      }
    });
    setInput('');
    setError(null);
  };

  const removeTickerFilter = (ticker: string) => {
    const key = `ticker__equals__${ticker}`;
    removeFilter(key);
    setActiveTickerFilters(prev => prev.filter(t => t !== ticker));
  };

  return (
    <ExpandableSidebarItem title="Ticker Symbol">
      <div className="filter-block">
        <div className="filter-block-label">Ticker Symbols</div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. AAPL, MSFT, GOOGL"
          className="sidebar-input filter-input-full"
        />
        <button onClick={handleAdd} className="filter-btn-add">
          Add Filter
        </button>
        {error && <div className="filter-warning">{error}</div>}
        {activeTickerFilters.length > 0 && (
          <div className="filter-chips">
            {activeTickerFilters.map(ticker => (
              <FilterChip
                key={ticker}
                label={ticker}
                onRemove={() => removeTickerFilter(ticker)}
              />
            ))}
          </div>
        )}
      </div>
    </ExpandableSidebarItem>
  );
};

export default TickerSymbolFilter;
