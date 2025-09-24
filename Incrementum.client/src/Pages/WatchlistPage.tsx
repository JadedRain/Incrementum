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




function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<StockC[]>([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockC | null>(null);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if(sortBy === 'price'){
      sortByPrice();
    }
    else{
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
      }
      }, [sortBy]);

  const sortByPrice = () => {
    setWatchlist(prev => {
      const sorted = [...prev].sort((a, b) => {
        const priceA = typeof a.currentPrice === 'number' ? a.currentPrice : -Infinity;
        const priceB = typeof b.currentPrice === 'number' ? b.currentPrice : -Infinity;
        return sortAsc ? priceA - priceB : priceB - priceA;
      });
      return sorted;
    });
    setSortAsc(s => !s);
  };

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
          sortByPrice={sortByPrice}
          sortAsc={sortAsc}
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