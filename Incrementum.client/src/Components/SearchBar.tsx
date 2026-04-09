import '../styles/SearchBar.css'
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";
import { searchCommunityScreeners } from "../Query/apiScreener";

type StockSuggestion = {
  symbol: string;
  name: string;
};

type ScreenerSuggestion = {
  id: number;
  screener_name: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [screenerSuggestions, setScreenerSuggestions] = useState<ScreenerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // total navigable items = stocks + screeners
  const totalItems = suggestions.length + screenerSuggestions.length;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setScreenerSuggestions([]);
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const [stockRes, screeners] = await Promise.all([
          fetchWrapper(() =>
            fetch(apiString(`/stocks/search/${encodeURIComponent(trimmed)}/0/`))
          ),
          searchCommunityScreeners(trimmed),
        ]);

        if (!stockRes.ok) {
          setSuggestions([]);
        } else {
          const data = await stockRes.json();
          const nextSuggestions: StockSuggestion[] = Array.isArray(data)
            ? data
                .filter((item: unknown): item is StockSuggestion => {
                  if (!item || typeof item !== 'object') return false;
                  const stock = item as StockSuggestion;
                  return typeof stock.symbol === 'string' && typeof stock.name === 'string';
                })
                .slice(0, 8)
            : [];
          setSuggestions(nextSuggestions);
        }

        setScreenerSuggestions(screeners);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setScreenerSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitSearch = (searchValue: string) => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    navigate(`/search/${trimmed}`);
  };

  const selectStock = (suggestion: StockSuggestion) => {
    setQuery(suggestion.symbol);
    setShowSuggestions(false);
    navigate(`/stock/${suggestion.symbol}`);
  };

  const selectScreener = (screener: ScreenerSuggestion) => {
    setQuery('');
    setShowSuggestions(false);
    navigate(`/screener/${screener.id}`);
  };

  const activateIndex = (index: number) => {
    if (index < suggestions.length) {
      selectStock(suggestions[index]);
    } else {
      selectScreener(screenerSuggestions[index - suggestions.length]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && totalItems > 0) {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((prev) => (prev + 1) % totalItems);
      return;
    }

    if (e.key === 'ArrowUp' && totalItems > 0) {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
      return;
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      if (showSuggestions && activeIndex >= 0 && activeIndex < totalItems) {
        activateIndex(activeIndex);
        return;
      }
      submitSearch(query);
    }
  };

  const hasAnySuggestions = suggestions.length > 0 || screenerSuggestions.length > 0;

  return (
    <div className="search-bar-container" ref={containerRef}>
      <input
        className="search-bar newsreader-font"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (hasAnySuggestions) setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search stocks..."
      />

      {showSuggestions && hasAnySuggestions && (
        <div className="search-bar-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={`stock-${suggestion.symbol}`}
              type="button"
              className={`search-bar-suggestion-item ${index === activeIndex ? 'search-bar-suggestion-item-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectStock(suggestion)}
            >
              <span className="search-bar-suggestion-symbol">{suggestion.symbol}</span>
              <span className="search-bar-suggestion-name">{suggestion.name}</span>
            </button>
          ))}

          {screenerSuggestions.length > 0 && (
            <>
              <div className="search-bar-section-label">Community Screeners</div>
              {screenerSuggestions.map((screener, index) => {
                const itemIndex = suggestions.length + index;
                return (
                  <button
                    key={`screener-${screener.id}`}
                    type="button"
                    className={`search-bar-suggestion-item search-bar-suggestion-item--screener ${itemIndex === activeIndex ? 'search-bar-suggestion-item-active' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectScreener(screener)}
                  >
                    <span className="search-bar-suggestion-name search-bar-suggestion-screener-name">{screener.screener_name}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}