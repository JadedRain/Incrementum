import '../App.css';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useEffect, useState } from 'react';
import Loading from '../Components/Loading';
import type { StockC } from '../Components/Stock';
import { WatchlistSidebar } from './WatchlistSidebar';
import { GridCards } from './GridCards';
import { ChartArea } from './ChartArea';
import { WatchlistHeader } from './WatchlistHeader';
import '../App.css'
import { useSortedWatchlist } from './useSortedWatchlist';

function WatchlistPage() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const user_id = apiKey || undefined;
  const [selectedStock, setSelectedStock] = useState<StockC | null>(null);
  const [sortBy, setSortBy] = useState('default');
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

  const handleStockClick = async (stock: StockC) => {
    setWatchlist(prev => prev.map(s =>
      s.symbol === stock.symbol ? { ...s, lastViewed: Date.now() } : s
    ));
    setSelectedStock({ ...stock, lastViewed: Date.now() });
    // Use utility function for removal
    const { removeFromWatchlist } = await import('../utils/watchlistActions');
    await removeFromWatchlist(stock.symbol, user_id ?? null, () => {}, () => {}, (inWatchlist) => {
      if (!inWatchlist) {
        setWatchlist(prev => prev.filter(s => s.symbol !== stock.symbol));
      }
    });
  };

  function addToWatchlist() {
    return async () => {
      if (selectedStock) {
        // Use utility function for addition
        const { addToWatchlist } = await import('../utils/watchlistActions');
        await addToWatchlist(selectedStock.symbol, user_id ?? null, () => {}, () => {}, (inWatchlist) => {
          if (inWatchlist) {
            setWatchlist(prev => [...prev, selectedStock]);
          }
        });
      }
    };
  }

  const imgUrl = selectedStock
    ? `http://localhost:8000/getStocks/${selectedStock.symbol}`
    : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <WatchlistHeader navigate={navigate} />
      <div className='WatchlistPage-Loading'>
        <Loading loading={loading} watchlist={watchlist} />
      </div>
      <div style={{ display: 'flex', marginTop: '2rem', padding: '0 2rem' }}>
        <div style={{ flex: 1 }}>
          <ChartArea selectedStock={selectedStock} imgUrl={imgUrl} />
          <GridCards />
          <button className="WatchlistPage-Custom-Button border-2 border-dotted border-[hsl(40,10%,17%)]">
            + Custom
          </button>
          <button
            className="WatchlistPage-Custom-Button"
            onClick={addToWatchlist()}
          >
            Add to Watchlist
          </button>
        </div>
        <WatchlistSidebar
          setSortBy={setSortBy}
          sortBy={sortBy}
          watchlist={watchlist}
          selectedStock={selectedStock}
          handleStockClick={handleStockClick}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default WatchlistPage