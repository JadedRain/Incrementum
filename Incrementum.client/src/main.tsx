import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SearchResults from "./Pages/SearchResults";
import StocksPage from './Pages/StocksPage'
import WatchlistPage from './Pages/WatchlistPage'
import Stock from "./Pages/Stock";
import ScreenerPage from "./Pages/ScreenerPage";
import IndividualScreenPage from "./Pages/IndividualScreenPage";
import CustomScreenerPage from "./Pages/CustomScreenerPage";
import SignInPage from "./Pages/LogInPage";
import SignupPage from "./Pages/SignupPage";
import IndividualCustomCollectionPage from "./Pages/IndividualCustomCollectionPage";
import CustomCollectionsPage from "./Pages/CustomCollectionsPage";
import { AuthProvider } from "./Context/AuthContext";
import SettingsPage from "./Pages/SettingsPage";
import CreateCustomCollectionPage from "./Pages/CreateCustomCollectionPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FilterPage from "./Pages/FilterPageTest";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
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
          <Route path="/screener/:id" element={<IndividualScreenPage />} />
          <Route path="/create-custom-screener" element={<CustomScreenerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/custom-collection/:id" element={<IndividualCustomCollectionPage />} />
          <Route path="/custom-collections" element={<CustomCollectionsPage />} />
          <Route path="/create-custom-collection" element={<CreateCustomCollectionPage />} />
          <Route path="/filter-test" element={<FilterPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </AuthProvider>
);