import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SearchResults from "./Pages/SearchResults";
import StocksPage from './Pages/StocksPage'
import WatchlistPage from './Pages/WatchlistPage'
import Stock from "./Stock";
import ScreenerPage from "./Pages/ScreenerPage";
import IndividualScreenPage from "./Pages/IndividualScreenPage";
import SignInPage from "./Pages/SignInPage";
import { AuthProvider } from "./AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/screener" element={<ScreenerPage />} />
        <Route path="/" element={<App />} />
        <Route index element={<SignInPage />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/stock/:token" element={<Stock />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/screener/:screenerName" element={<IndividualScreenPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);