import '../styles/Stocks/StocksPage.css'
import '../styles/NavBar.css'
import { useNavigate } from 'react-router-dom'
import StockInfoPage from './StockInfoList';

function StocksPage() {
  const navigate = useNavigate()

  return (
    <div className="stocks-page-wrapper">
      <div className='StocksPage-header'>
        <button
          onClick={() => navigate('/watchlist')}
          className="nav-button">
          Watchlist
        </button>
        <h1 className="StocksPage-h1">Stocks Page</h1>
      </div>
      <div className="stocks-page-inner">
        <StockInfoPage />
      </div>
    </div>
  );
}

export default StocksPage