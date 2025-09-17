import '../App.css'
import { useNavigate } from 'react-router-dom'
import StockInfoList from '../StockInfoList';

function StocksPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh' }} className='bg-[#6C5019]'>
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
        <StockInfoList />
      </div>
    </div>
  );
}

export default StocksPage