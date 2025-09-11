import '../App.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'


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
    <>
      <div>
        <h1>Watchlist Page</h1>
        <button onClick={() => navigate('/')}> ← </button>
        <div style={{ marginTop: '2rem' }}>
          {loading ? (
            <p>Loading...</p>
          ) : watchlist.length === 0 ? (
            <p>No items found in watchlist</p>
          ) : (
            <ul>
              {watchlist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default WatchlistPage