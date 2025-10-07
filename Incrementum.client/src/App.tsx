import './App.css'
import NavigationBar from './Components/NavigationBar'
import StockInfoList from './Pages/StockInfoList'

function App() {
  return (
    <>
      <NavigationBar />
      <div className="main-content">
        <StockInfoList />
      </div>
    </>
  )
}

export default App
