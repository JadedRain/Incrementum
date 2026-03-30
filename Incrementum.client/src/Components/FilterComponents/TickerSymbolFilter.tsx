import React, { useEffect, useMemo, useState } from 'react';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import { apiString, fetchWrapper } from '../../Context/FetchingHelper';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import FilterChip from '../FilterChip';

type ActiveTickerFilter = {
  value: string;
  operator: string;
};

const TickerSymbolFilter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTickerFilters, setActiveTickerFilters] = useState<ActiveTickerFilter[]>([]);
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const tickerFiltersFromContext = useMemo(() => {
    return Object.values(filterDict)
      .filter((f) => f.operand === 'ticker')
      .map((f) => ({
        value: typeof f.value === 'string' ? f.value : String(f.value ?? ''),
        operator: f.operator,
      }))
      .filter((f) => f.value.length > 0)
      .sort((a, b) => {
        const aKey = `${a.operator}__${a.value}`;
        const bKey = `${b.operator}__${b.value}`;
        return aKey.localeCompare(bKey);
      });
  }, [filterDict]);

  // Keep chip UI in sync with context (e.g., when applying shared links)
  useEffect(() => {
    const next = tickerFiltersFromContext;
    setActiveTickerFilters((prev) => {
      if (prev.length === next.length && prev.every((p, i) => p.value === next[i].value && p.operator === next[i].operator)) {
        return prev;
      }
      return next;
    });
  }, [tickerFiltersFromContext]);

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
          const exists = activeTickerFilters.some((t) => t.value === symbol && t.operator === 'equals');
          if (!exists) {
            addFilter({
              operator: 'equals',
              operand: 'ticker',
              filter_type: 'categoric',
              value: symbol,
            });
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
      const exists = activeTickerFilters.some((t) => t.value === symbol && t.operator === 'contains');
      if (!exists) {
        addFilter({
          operator: 'contains',
          operand: 'ticker',
          filter_type: 'categoric',
          value: symbol,
        });
      }
    });

    setInput('');
    setError(null);
  };

  const removeTickerFilter = (ticker: string, operator: string) => {
    const key = `ticker__${operator}__${ticker}`;
    removeFilter(key);
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
            {activeTickerFilters.map(({ value, operator }) => (
              <FilterChip
                key={`${operator}__${value}`}
                label={value}
                onRemove={() => removeTickerFilter(value, operator)}
              />
            ))}
          </div>
        )}
      </div>
    </ExpandableSidebarItem>
  );
};

export default TickerSymbolFilter;
