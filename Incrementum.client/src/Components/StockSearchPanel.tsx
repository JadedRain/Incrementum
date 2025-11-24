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
          className="w-full bg-transparent border-0 border-b-2 border-[hsl(40,62%,40%)] px-0 py-2 text-[hsl(40,62%,20%)] placeholder-[hsl(40,62%,40%)] focus:outline-none focus:border-[hsl(40,62%,20%)]"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
        />
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(40,62%,30%)]"
          onClick={onSearch} 
          disabled={searching}
        >
          🔍
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div 
          className="space-y-2 overflow-y-auto search-results-container flex-1" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.search-results-container::-webkit-scrollbar { display: none; }`}</style>
          {searchResults.map((stock, idx) => (
            <div key={stock.symbol || idx} className="bg-[hsl(40,63%,73%)] p-3 flex items-center justify-between" style={{ borderRadius: '2px' }}>
              <div>
                <div className="font-semibold text-[hsl(40,62%,20%)]">{stock.symbol}</div>
                <div className="text-xs text-[hsl(40,62%,30%)]">{stock.name || stock.longName || 'Full Stock name'}</div>
              </div>
              <button 
                className="text-2xl text-[hsl(79,26%,36%)] hover:text-[hsl(79,26%,46%)]"
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
