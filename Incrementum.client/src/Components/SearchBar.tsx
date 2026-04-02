import '../styles/SearchBar.css'
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

type StockSuggestion = {
  symbol: string;
  name: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetchWrapper(() =>
          fetch(apiString(`/stocks/search/${encodeURIComponent(trimmed)}/0/`))
        );
        if (!res.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data = await res.json();
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
        setShowSuggestions(nextSuggestions.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
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

  const selectSuggestion = (suggestion: StockSuggestion) => {
    setQuery(suggestion.symbol);
    setShowSuggestions(false);
    navigate(`/stock/${suggestion.symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      if (showSuggestions && activeIndex >= 0 && activeIndex < suggestions.length) {
        selectSuggestion(suggestions[activeIndex]);
        return;
      }
      submitSearch(query);
    }
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <input
        className="search-bar newsreader-font"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search stocks..."
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-bar-suggestions" role="listbox" aria-label="Stock suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.symbol}-${suggestion.name}`}
              type="button"
              className={`search-bar-suggestion-item ${index === activeIndex ? 'search-bar-suggestion-item-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
            >
              <span className="search-bar-suggestion-symbol">{suggestion.symbol}</span>
              <span className="search-bar-suggestion-name">{suggestion.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}