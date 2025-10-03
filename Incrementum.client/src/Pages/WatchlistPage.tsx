import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useEffect, useState } from 'react';
import Loading from '../Components/Loading';
import type { StockC } from '../Components/Stock';
import { WatchlistSidebar } from './WatchlistSidebar';
import { GridCards } from './GridCards';
import { ChartArea } from './ChartArea';
import NavigationBar from '../Components/NavigationBar';
import { useSortedWatchlist } from './useSortedWatchlist';

function WatchlistPage() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const user_id = apiKey || undefined;
  const [selectedStock, setSelectedStock] = useState<StockC | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const watchlistState = apiKey ? useSortedWatchlist(sortBy, user_id) : { watchlist: [], setWatchlist: () => { }, loading: false };
  const { watchlist, setWatchlist, loading } = watchlistState;

  useEffect(() => {
    if (!apiKey) {
      navigate('/');
    }
  }, [apiKey]);

  useEffect(() => {
    if (watchlist.length > 0 && (!selectedStock || !watchlist.find(s => s.symbol === selectedStock.symbol))) {
      setSelectedStock(watchlist[0]);
    }
  }, [watchlist, selectedStock]);

  const handleStockClick = (stock: StockC) => {
    setWatchlist(prev => prev.map(s =>
      s.symbol === stock.symbol ? { ...s, lastViewed: Date.now() } : s
    ));
    setSelectedStock({ ...stock, lastViewed: Date.now() });
  };

  function addToWatchlist() {
  return async () => {
    try {
      if (selectedStock) {
        // Use utility function for addition
        const { addToWatchlist } = await import('../utils/watchlistActions');
        await addToWatchlist(
          selectedStock.symbol,
          user_id ?? null,
          () => {},
          () => {},
          (inWatchlist) => {
            if (inWatchlist) {
              setWatchlist(prev => [...prev, selectedStock]);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };
}function addToWatchlist() {
  return async () => {
    try {
      if (selectedStock) {
        // Use utility function for addition
        const { addToWatchlist } = await import('../utils/watchlistActions');
        await addToWatchlist(
          selectedStock.symbol,
          user_id ?? null,
          () => {},
          () => {},
          (inWatchlist) => {
            if (inWatchlist) {
              setWatchlist(prev => [...prev, selectedStock]);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };
}

  const imgUrl = selectedStock
    ? `http://localhost:8000/getStocks/${selectedStock.symbol}`
    : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <NavigationBar />
      {toast && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      <div className='WatchlistPage-Loading'>
        <Loading loading={loading} watchlist={watchlist} />
      </div>
      <div style={{ display: 'flex', marginTop: '2rem', padding: '0 2rem' }}>
        <WatchlistSidebar
          setSortBy={setSortBy}
          sortBy={sortBy}
          watchlist={watchlist}
          selectedStock={selectedStock}
          handleStockClick={handleStockClick}
          loading={loading}
        />
        <div className="main-content" style={{ flex: 1 }}>
          <ChartArea selectedStock={selectedStock} imgUrl={imgUrl} />
          <GridCards />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <button className="WatchlistPage-Custom-Button">
                + Custom
              </button>
              <button
                className="WatchlistPage-Custom-Button"
                onClick={addToWatchlist()}
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchlistPage