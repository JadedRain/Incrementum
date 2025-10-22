import '../styles/Stocks/StocksPage.css'
import '../styles/NavBar.css'
import { useNavigate } from 'react-router-dom'
import StockInfoPage from './StockInfoList';

function StocksPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh' }} className='bg-[hsl(40,13%,53%)]'>
      <div className='StocksPage-header'>
        <button 
        onClick={() => navigate('/watchlist')}
        className="nav-button">
          Watchlist 
        </button>
        <h1 className="StocksPage-h1">
          Stocks Page
        </h1>
      </div>
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <StockInfoPage />
      </div>
    </div>
  );
}

export default StocksPage