import '../App.css'
import { useNavigate } from 'react-router-dom'

function StocksPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className='StocksPage-header'>
        <button 
        onClick={() => navigate('/watchlist')} 
        style={{ marginLeft: '2rem', fontSize: '1.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>
          Watchlist 
        </button>
        <h1 className="StocksPage-h1">
          Stocks Page
        </h1>
      </div>
      <div style={{ width: '4.5rem', marginRight: '2rem' }}></div>
    </div>
  );
}

export default StocksPage