// import { useState } from 'react'
import './App.css'
import SearchBar from './Components/SearchBar'
import StockInfoList from './StockInfoList'

function App() {
  return (
    <>
      <div>
        <SearchBar />
      </div>
    <div>
      <StockInfoList />
    </div>
    </>
  )
}

export default App
