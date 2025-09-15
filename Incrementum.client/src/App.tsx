// import { useState } from 'react'
import './App.css'
import SearchBar from './searchBar'

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
