import React, { useState } from 'react';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import { apiString, fetchWrapper } from '../../Context/FetchingHelper';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import FilterChip from '../FilterChip';

const TickerSymbolFilter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTickerFilters, setActiveTickerFilters] = useState<string[]>([]);
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  // Clear local state when filters are reset
  React.useEffect(() => {
    const tickerKeys = Object.keys(filterDict).filter(key => key.startsWith('ticker__'));
    if (tickerKeys.length === 0 && activeTickerFilters.length > 0) {
      setActiveTickerFilters([]);
    }
  }, [filterDict, activeTickerFilters.length]);

  const handleAdd = async () => {
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

    // Separate wildcards from regular symbols
    const wildcardSymbols = symbols.filter(s => s.includes('*'));
    const regularSymbols = symbols.filter(s => !s.includes('*'));

    // Validate regular ticker symbols against the database
    if (regularSymbols.length > 0) {
      try {
        const response = await fetchWrapper(() => 
          fetch(apiString('/stocks/validate-tickers/'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symbols: regularSymbols }),
          })
        );

        if (!response.ok) {
          setError('Failed to validate ticker symbols.');
          return;
        }

        const data = await response.json();
        const { valid, invalid } = data;

        if (invalid.length > 0) {
          setError(`No information for the following symbols: ${invalid.join(', ')}`);
          return;
        }

        // Add valid regular symbols to the filter
        valid.forEach((symbol: string) => {
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
      } catch (err) {
        console.error('Error validating ticker symbols:', err);
        setError('An error occurred while validating ticker symbols.');
        return;
      }
    }

    // Add wildcard symbols without validation
    wildcardSymbols.forEach(symbol => {
      if (!activeTickerFilters.includes(symbol)) {
        addFilter({
          operator: 'contains',
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
