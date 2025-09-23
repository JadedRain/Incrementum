
import '../App.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Loading from '../Components/Loading'


function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [rawWatchlist, setRawWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/watchlist/', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load watchlist');
        return res.json();
      })
      .then(data => {
        const items = Array.isArray(data.watchlist) ? data.watchlist : [];
        setRawWatchlist(items);
        const labels: string[] = items.map((it: any) =>
          typeof it === 'string'
            ? it
            : (it?.displayName || it?.longName || it?.shortName || it?.symbol || 'Unknown')
        );
        setWatchlist(labels);
        setLoading(false);
      })
      .catch(() => {
        setWatchlist([]);
        setRawWatchlist([]);
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
      {/* Top summary: company name + symbol */}
      <div style={{ padding: '1rem 2rem' }}>
        {rawWatchlist.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {rawWatchlist.map((it: any, idx: number) => {
              const name = it?.displayName || it?.longName || it?.shortName || '';
              const symbol = it?.symbol || '';
              if (!name && !symbol) return null;
              return (
                <div key={idx} style={{
                  background: '#f7f7f7',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  padding: '6px 10px',
                  color: '#111',
                }}>
                  <strong>{name || symbol}</strong>
                  {name && symbol ? ` (${symbol})` : ''}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className='WatchlistPage-Loading'>
        <Loading loading={loading} watchlist={watchlist} />
      </div>

      {/* Main grid and sidebar layout */}
      <div style={{ display: 'flex', marginTop: '2rem', padding: '0 2rem' }}>

        {/* Main grid area */}
        <div style={{ flex: 1 }}>
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
          
          {/* Sidebar content here */}
        </div>
      </div>
    </div>
  );
}

export default WatchlistPage