import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StocksPage from './Pages/StocksPage'
import WatchlistPage from './Pages/WatchlistPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index="/stocks" element={<StocksPage />} />
        <Route path="/" element={<StocksPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
