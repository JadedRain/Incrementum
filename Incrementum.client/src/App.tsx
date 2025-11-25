import './App.css'
import NavigationBar from './Components/NavigationBar'
import { useAuth } from './Context/AuthContext';
import LogInPage from './Pages/LogInPage';
import StockInfoList from './Pages/StockInfoList'

function App() {
  const { apiKey } = useAuth();
  
  if (!apiKey) {
    return <LogInPage />;
  }
  
  return (
    <>
      <NavigationBar />
      <div className="main-content">
        <StockInfoList />
      </div>
    </>
  );
}

export default App
