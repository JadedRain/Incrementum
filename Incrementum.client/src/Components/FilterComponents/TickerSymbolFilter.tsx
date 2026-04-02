import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import { apiString, fetchWrapper } from '../../Context/FetchingHelper';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import FilterChip from '../FilterChip';

type ActiveTickerFilter = {
  value: string;
  operator: string;
};

type TickerSuggestion = {
  symbol: string;
  name: string;
};

const TickerSymbolFilter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTickerFilters, setActiveTickerFilters] = useState<ActiveTickerFilter[]>([]);
  const [tickerSuggestions, setTickerSuggestions] = useState<TickerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  const getActiveToken = (rawInput: string) => {
    const normalized = rawInput.replace(/,/g, ' ');
    const parts = normalized.split(/\s+/).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : '';
  };

  const replaceActiveToken = (rawInput: string, symbol: string) => {
    const hasTrailingSeparator = /[\s,]+$/.test(rawInput);
    if (hasTrailingSeparator || rawInput.trim().length === 0) {
      return `${rawInput}${symbol}, `;
    }

    const tokenRegex = /([^\s,]+)$/;
    if (!tokenRegex.test(rawInput)) {
      return `${rawInput}${symbol}, `;
    }

    return `${rawInput.replace(tokenRegex, symbol)}, `;
  };

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

  useEffect(() => {
    const token = getActiveToken(input).trim();
    if (token.length < 1) {
      setTickerSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetchWrapper(() =>
          fetch(apiString(`/stocks/search/${encodeURIComponent(token)}/0/`))
        );
        if (!response.ok) {
          setTickerSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const data = await response.json();
        const normalizedToken = token.toUpperCase();
        const suggestions: TickerSuggestion[] = Array.isArray(data)
          ? data
              .filter((item: unknown): item is TickerSuggestion => {
                if (!item || typeof item !== 'object') return false;
                const stock = item as TickerSuggestion;
                return typeof stock.symbol === 'string' && typeof stock.name === 'string';
              })
              .filter((stock) => stock.symbol.toUpperCase().includes(normalizedToken))
              .slice(0, 8)
          : [];

        setTickerSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setActiveSuggestionIndex(-1);
      } catch {
        setTickerSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (symbol: string) => {
    setInput((prev) => replaceActiveToken(prev, symbol));
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

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
      <div className="filter-block" ref={suggestionBoxRef}>
        <div className="filter-block-label">Ticker Symbols</div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onFocus={() => {
            if (tickerSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown' && tickerSuggestions.length > 0) {
              e.preventDefault();
              setShowSuggestions(true);
              setActiveSuggestionIndex((prev) => (prev + 1) % tickerSuggestions.length);
              return;
            }

            if (e.key === 'ArrowUp' && tickerSuggestions.length > 0) {
              e.preventDefault();
              setShowSuggestions(true);
              setActiveSuggestionIndex((prev) => (prev <= 0 ? tickerSuggestions.length - 1 : prev - 1));
              return;
            }

            if (e.key === 'Escape') {
              setShowSuggestions(false);
              setActiveSuggestionIndex(-1);
              return;
            }

            if (e.key === 'Enter') {
              e.preventDefault();
              if (showSuggestions && activeSuggestionIndex >= 0 && activeSuggestionIndex < tickerSuggestions.length) {
                selectSuggestion(tickerSuggestions[activeSuggestionIndex].symbol);
                return;
              }
              handleAdd();
            }
          }}
          placeholder="e.g. AAPL, MSFT, GOOGL"
          className="sidebar-input filter-input-full"
        />
        {showSuggestions && tickerSuggestions.length > 0 && (
          <div className="sidebar-suggestions" role="listbox" aria-label="Ticker suggestions">
            {tickerSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.symbol}-${suggestion.name}`}
                type="button"
                className={`sidebar-suggestion-item ${index === activeSuggestionIndex ? 'sidebar-suggestion-item-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(suggestion.symbol)}
              >
                <span className="sidebar-suggestion-symbol">{suggestion.symbol}</span>
                <span className="sidebar-suggestion-name">{suggestion.name}</span>
              </button>
            ))}
          </div>
        )}
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
