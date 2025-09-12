// import { useState } from 'react'
import './App.css'
import SearchBar from './searchBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StocksPage from './Pages/StocksPage'
import WatchlistPage from './Pages/WatchlistPage'
import StockInfoList from './StockInfoList'

function App() {
  // const [count, setCount] = useState(0)


  return (
    <>
      <div>
        <SearchBar />
      </div>
    <BrowserRouter>
      <Routes>
        <Route index="/stocks" element={<StocksPage />} />
        <Route path="/" element={<StocksPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </BrowserRouter>
    <div>
      <StockInfoList />
    </div>
    </>
  )
}

export default App
