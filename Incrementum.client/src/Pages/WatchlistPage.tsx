import '../App.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Loading from '../Components/Loading'
import type { StockC } from '../Components/Stock'


const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Date Added', value: 'date_added' },
];

function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<StockC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockC | null>(null);
  const [period, setPeriod] = useState("1y");
  const [interval, setInterval] = useState("1d");
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const endpoint =
      sortBy === 'date_added'
        ? 'http://localhost:8000/watchlist/sorted/'
        : 'http://localhost:8000/watchlist/';
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setWatchlist(data.watchlist || []);
        setLoading(false);
        // Select the first stock by default if available
        if ((data.watchlist || []).length > 0) {
          setSelectedStock(data.watchlist[0]);
        }
      })
      .catch(() => {
        setWatchlist([]);
        setLoading(false);
      });
  }, [sortBy]);

  // Update selected stock if watchlist changes and selected is missing
  useEffect(() => {
    if (watchlist.length > 0 && (!selectedStock || !watchlist.find(s => s.symbol === selectedStock.symbol))) {
      setSelectedStock(watchlist[0]);
    }
  }, [watchlist]);

  const handleStockClick = (stock: StockC) => {
    setSelectedStock(stock);
  };

  // Chart image URL for selected stock
  const imgUrl = selectedStock
    ? `http://localhost:8000/getStocks/${selectedStock.symbol}/?period=${period}&interval=${interval}`
    : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className='WatchlistPage-header'>
        <button
          onClick={() => navigate('/')}
          style={{ marginLeft: '2rem', fontSize: '1.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          ←
        </button>
        <h1 className="WatchlistPage-h1">
          Watchlist Page
        </h1>
        <div style={{ width: '4.5rem', marginRight: '2rem' }}></div>
      </div>
      <div className='WatchlistPage-Loading'>
        <Loading loading={loading} watchlist={watchlist} />
      </div>

      {/* Main grid and sidebar layout */}
      <div style={{ display: 'flex', marginTop: '2rem', padding: '0 2rem' }}>
        {/* Main grid area */}
        <div style={{ flex: 1 }}>
          {/* Stock chart and controls */}
          {selectedStock && (
            <div style={{ marginBottom: '2rem', background: '#f9f7f3', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>
                {selectedStock.shortName || selectedStock.displayName} ({selectedStock.symbol})
              </h2>
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt={`${selectedStock.symbol} stock chart`}
                  style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px #ccc' }}
                />
              )}
            </div>
          )}

          {/* Example grid cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              marginBottom: '2rem',
            }}
          >
            <div className="WatchlistPage-card">Short term<br />Desc</div>
            <div className="WatchlistPage-card">Long term<br />Desc</div>
            <div className="WatchlistPage-card">Analyst Picks<br />Desc</div>
            <div className="WatchlistPage-card">Daily gain<br />Desc</div>
            <div className="WatchlistPage-card">Daily dip<br />Desc</div>
            <div className="WatchlistPage-card">Highest Volatility<br />Desc</div>
          </div>
          <button className="WatchlistPage-Custom-Button">
            + Custom
          </button>
        </div>

        {/* Sidebar */}
        <div className="WatchlistPage-Sidebar">
          <h3 style={{ marginTop: 0 , color: 'black' }}>Market Screeners</h3>
          {/* Watchlist stocks */}
          <div style={{ marginTop: '2rem' }}>
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
                  </li>
                ))}
              </ul>
            )}
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
        </div>
      </div>
    </div>
  );
}

export default WatchlistPage