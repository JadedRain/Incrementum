import '../App.css'
import { useNavigate } from 'react-router-dom'

function StocksPage() {
  const navigate = useNavigate()

  return (
    <>
      <div>
        <h1>Stocks Page</h1>
        <button onClick={() => navigate('/watchlist')}> Watchlist </button>
      </div>
    </>
  )
}

export default StocksPage