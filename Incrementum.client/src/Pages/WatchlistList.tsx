import type { StockC } from '../Components/Stock';


export function WatchlistList({ watchlist, selectedStock, handleStockClick, loading }: {
  watchlist: StockC[];
  selectedStock: StockC | null;
  handleStockClick: (stock: StockC) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h4 style={{ color: 'black' }}>Your Watchlist</h4>
      {loading ? (
        <div>Loading...</div>
      ) : !watchlist || watchlist.length === 0 ? (
        <div>No stocks in your watchlist.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {watchlist.map((stock, idx) => (
            <li
              key={idx}
              style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid #eee',
                color: selectedStock && selectedStock.symbol === stock.symbol ? '#fff' : 'black',
                background: selectedStock && selectedStock.symbol === stock.symbol ? '#6C5019' : 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: selectedStock && selectedStock.symbol === stock.symbol ? 'bold' : 'normal'
              }}
              onClick={() => handleStockClick(stock)}
            >
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {stock.symbol} <span style={{ color: '#888', fontWeight: 'normal' }}>{stock.shortName || stock.displayName}</span>
              </div>
              <div style={{ fontSize: '0.95rem', color: selectedStock && selectedStock.symbol === stock.symbol ? '#ffe9b3' : '#333' }}>
                ${stock.currentPrice?.toFixed(2) ?? 'N/A'}
              </div>
              {stock.lastViewed && (
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                  Last viewed: {new Date(stock.lastViewed).toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
