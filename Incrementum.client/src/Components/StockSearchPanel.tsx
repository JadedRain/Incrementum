import React from 'react';

interface StockItem {
  symbol: string;
  name?: string;
  longName?: string;
  [key: string]: unknown;
}

interface StockSearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  searching: boolean;
  searchResults: StockItem[];
  onAddStock: (symbol: string) => void;
}

const StockSearchPanel: React.FC<StockSearchPanelProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searching,
  searchResults,
  onAddStock
}) => {
  return (
    <>
      <div className="relative mb-4 flex-shrink-0">
        <input
          className="w-full bg-transparent border-0 border-b-2 border-[var(--bg-sunken)] px-0 py-2 text-[var(--text-primary)] placeholder-[var(--bg-sunken)] focus:outline-none focus:border-[var(--text-primary)]"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
        />
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-primary)]"
          onClick={onSearch} 
          disabled={searching}
        >
          🔍
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div 
          className="space-y-2 overflow-y-auto search-results-container search-panel-results flex-1"
        >
          {searchResults.map((stock, idx) => (
            <div key={stock.symbol || idx} className="search-panel-result-row">
              <div>
                <div className="search-panel-result-symbol">{stock.symbol}</div>
                <div className="search-panel-result-name">{stock.name || stock.longName || 'Full Stock name'}</div>
              </div>
              <button 
                className="search-panel-add-btn"
                onClick={() => onAddStock(stock.symbol)}
              >+</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default StockSearchPanel;
