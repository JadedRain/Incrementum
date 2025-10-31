import '../styles/WatchlistPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useEffect, useState } from 'react';
import Loading from '../Components/Loading';
import type { StockC } from '../Components/Stock';
// import { CgAddR } from "react-icons/cg";
import NavigationBar from '../Components/NavigationBar';
import Toast from '../Components/Toast';
import { useSortedWatchlist } from '../hooks/useSortedWatchlist';
import AppCard from '../Components/AppCard';

function WatchlistPage() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const user_id = apiKey || undefined;
  const [selectedStock, setSelectedStock] = useState<StockC | null>(null);
  const [sortBy, _setSortBy] = useState('default');
  const [toast, _setToast] = useState<string | null>(null);
  const watchlistState = apiKey ? useSortedWatchlist(sortBy, user_id) : { watchlist: [], setWatchlist: () => { }, loading: false };
  const { watchlist } = watchlistState;

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

  // const handleStockClick = (stock: StockC) => {
  //   setWatchlist(prev => prev.map(s =>
  //     s.symbol === stock.symbol ? { ...s, lastViewed: Date.now() } : s
  //   ));
  //   setSelectedStock({ ...stock, lastViewed: Date.now() });
  // };

  // const handleaddscreenerclick =

  return (
    <div style={{ minHeight: '100vh' }} className='bg-[hsl(40,13%,53%)]'>
      <NavigationBar />
      <Toast message={toast} />
      <div>
        <Loading loading={false} loadingText="Loading Watchlist..." />
      </div>
      <h1 className="text-[hsl(42,15%,70%)] text-4xl text-left ml-8 mb-0 mt-8 newsreader-font">
        Watchlist
      </h1>
      <div className="WatchlistPage-main-content pt-4">
        <div className="WatchlistPage-card-grid">
          <AppCard
            title="Text"
            subtitle="Body text."
          />
          <AppCard
            title="Text"
            subtitle="Body text."
          />
          <AppCard
            title="Text"
            subtitle="Body text."
          />
        </div>
      </div>
      <button
        type="button"
        className="Add-screener-button cursor-pointer text-2xl"
      >
        {/* <CgAddR /> */}  Screener
      </button>
      <div className="WatchlistPage-right-sidebar">
        <div
          className="w-full text-left py-4 border-b border-[hsl(40,46%,36%)] px-1 text-[hsl(40,46%,36%)] text-2xl"
        >
          Stocks
        </div>
      </div>
    </div>
  );
}

export default WatchlistPage