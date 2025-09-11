
import '../App.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Loading from '../Components/Loading'


function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/watchlist/')
      .then(res => res.json())
      .then(data => {
        setWatchlist(data.watchlist || []);
        setLoading(false);
      })
      .catch(() => {
        setWatchlist([]);
        setLoading(false);
      });
  }, []);

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
    </div>
  );
}

export default WatchlistPage