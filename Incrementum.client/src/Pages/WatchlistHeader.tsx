import { useNavigate } from 'react-router-dom';

export function WatchlistHeader({ navigate }: { navigate: ReturnType<typeof useNavigate>; }) {
  return (
    <div className='WatchlistPage-header'>
      <button
        onClick={() => navigate('/')}
        style={{ marginLeft: '2rem', fontSize: '1.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        ←
      </button>
      <h1 className="WatchlistPage-h1">Watchlist Page</h1>
      <div style={{ width: '4.5rem', marginRight: '2rem' }}></div>
    </div>
  );
}
