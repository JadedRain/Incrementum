import { useLocation, useNavigate } from 'react-router-dom';

export function WatchlistHeader({ navigate }: { navigate: ReturnType<typeof useNavigate>; }) {
  const location = useLocation();
  const isWatchlist = location.pathname.includes('watchlist');
  const isCustom = location.pathname.includes('customcollections');
  return (
    <div className='WatchlistPage-header flex items-center justify-between'>
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="WatchlistPage-h1">{isCustom ? 'Custom Collections' : 'Watchlist Page'}</h1>
      </div>
      <div className="absolute bottom-0 right-0 flex gap-3 mb-3 mr-6 z-10">
        <button
          className={`px-2 py-1 text-base rounded font-semibold transition-colors duration-200 border ${isWatchlist ? 'bg-[hsl(40,66%,60%)] text-[hsl(41,61%,9%)] border-[hsl(40,66%,60%)]' : 'bg-transparent text-[hsl(40,66%,60%)] border-[hsl(40,66%,60%)] hover:bg-[hsl(41,61%,9%)] hover:text-[hsl(40,66%,60%)]'}`}
          onClick={() => navigate('/watchlist')}
        >
          Watchlist
        </button>
        <button
          className={`px-2 py-1 text-base rounded font-semibold transition-colors duration-200 border ${isCustom ? 'bg-[hsl(40,66%,60%)] text-[hsl(41,61%,9%)] border-[hsl(40,66%,60%)]' : 'bg-transparent text-[hsl(40,66%,60%)] border-[hsl(40,66%,60%)] hover:bg-[hsl(41,61%,9%)] hover:text-[hsl(40,66%,60%)]'}`}
          onClick={() => navigate('/custom-collections')}
        >
          Custom Collections
        </button>
      </div>
      <div style={{ width: '4.5rem', marginRight: '2rem' }}></div>
    </div>
  );
}
