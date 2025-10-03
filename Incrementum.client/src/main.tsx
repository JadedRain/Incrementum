import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SearchResults from "./Pages/SearchResults";
import StocksPage from './Pages/StocksPage'
import WatchlistPage from './Pages/WatchlistPage'
import Stock from "./Stock";
import ScreenerPage from "./Pages/ScreenerPage";
import IndividualScreenPage from "./Pages/IndividualScreenPage";
import CustomScreenerPage from "./Pages/CustomScreenerPage";
import SignInPage from "./Pages/LogInPage";
import SignupPage from "./Pages/SignupPage";
import IndividualCustomCollectionPage from "./Pages/IndividualCustomCollectionPage";
import CustomCollectionsPage from "./Pages/CustomCollectionsPage";
import { AuthProvider } from "./Context/AuthContext";
import AccountPage from "./Pages/AccountPage";
import CreateCustomCollectionPage from "./Pages/CreateCustomCollectionPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/screener" element={<ScreenerPage />} />
        <Route path="/" element={<App />} />
        <Route index element={<SignInPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/stock/:token" element={<Stock />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/screener/:screenerName" element={<IndividualScreenPage />} />
        <Route path="/create-custom-screener" element={<CustomScreenerPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/custom-collection/:id" element={<IndividualCustomCollectionPage />} />
        <Route path="/custom-collections" element={<CustomCollectionsPage />} />
        <Route path="/create-custom-collection" element={<CreateCustomCollectionPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);