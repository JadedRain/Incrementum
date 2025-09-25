import type { StockC } from '../Components/Stock';
import { WatchlistList } from './WatchlistList';
const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Date Added', value: 'date_added' },
  { label: 'Recently Viewed', value: 'recently_viewed' },
  { label: 'Name', value: 'name' },
  { label: 'Price (asc)', value: 'price_asc' },
  { label: 'Price (desc)', value: 'price_desc' },
];

export function WatchlistSidebar({ sortBy, setSortBy, watchlist, selectedStock, handleStockClick, loading }: {
  sortBy: string;
  setSortBy: (value: string) => void;
  watchlist: StockC[];
  selectedStock: StockC | null;
  handleStockClick: (stock: StockC) => void;
  loading: boolean;
}) {
  return (
    <div className="WatchlistPage-Sidebar">
      <h3 style={{ marginTop: 0, color: 'black' }}>Market Screeners</h3>
      <div style={{ marginTop: '2rem' }}>
          <div style={{ padding: '8px 0 0 12px' }}>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                marginBottom: '10px',
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #e5e5e5',
                fontWeight: 500,
                color: '#222',
                background: '#f7f7f7',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
      </div>
      <WatchlistList
        watchlist={watchlist}
        selectedStock={selectedStock}
        handleStockClick={handleStockClick}
        loading={loading}
      />
    </div>
  );
}
