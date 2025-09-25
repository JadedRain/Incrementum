import '../App.css';
import { useNavigate } from 'react-router-dom';
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
  const [selectedStock, setSelectedStock] = useState<StockC | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const { watchlist, setWatchlist, loading } = useSortedWatchlist(sortBy);

  useEffect(() => {
    if (watchlist.length > 0 && (!selectedStock || !watchlist.find(s => s.symbol === selectedStock.symbol))) {
      setSelectedStock(watchlist[0]);
    }
  }, [watchlist, selectedStock]);

  const handleStockClick = (stock: StockC) => {
    // Set lastViewed for the clicked stock
    setWatchlist(prev => prev.map(s =>
      s.symbol === stock.symbol ? { ...s, lastViewed: Date.now() } : s
    ));
    setSelectedStock({ ...stock, lastViewed: Date.now() });
  };

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
          <button className="WatchlistPage-Custom-Button">
            + Custom
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