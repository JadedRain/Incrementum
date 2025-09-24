import type { StockC } from '../Components/Stock';
import { WatchlistList } from './WatchlistList';
const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Date Added', value: 'date_added' },
  { label: 'Price', value: 'price' },
];
export function WatchlistSidebar({ sortByPrice, sortAsc, watchlist, selectedStock, handleStockClick, loading, sortBy, setSortBy}: {
  sortByPrice: () => void;
  sortAsc: boolean;
  watchlist: StockC[];
  selectedStock: StockC | null;
  handleStockClick: (stock: StockC) => void;
  loading: boolean;
  sortBy: string;
  setSortBy: (value: string) => void; 
  
  
}) {
  return (
    <div className="WatchlistPage-Sidebar">
      <h3 style={{ marginTop: 0, color: 'black' }}>Market Screeners</h3>
      <div style={{ marginTop: '2rem' }}>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#333', fontSize: '1.1rem', padding: '6px 0' }}>
            Sort
          </summary>
          <div style={{ padding: '8px 0 0 12px' }}>
            <button
              style={{
                background: '#f7f7f7',
                border: '1px solid #e5e5e5',
                borderRadius: 6,
                padding: '6px 14px',
                color: '#222',
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: '6px',
              }}
              onClick={sortByPrice}
            >
              Sort by Current Price {sortAsc ? '(asc)' : '(desc)'}
            </button>
          </div>
        </details>
      </div>
      <WatchlistList
        watchlist={watchlist}
        selectedStock={selectedStock}
        handleStockClick={handleStockClick}
        loading={loading} />
                    <select
          id="sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
    </div>
  );
}
