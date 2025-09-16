import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SearchResults from "./SearchResults";
import WatchlistPage from "./Pages/WatchlistPage";
import StocksPage from "./Pages/StocksPage";
import ScreenerPage from "./Pages/ScreenerPage";
import IndividualScreenPage from "./Pages/IndividualScreenPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<ScreenerPage />} />
        <Route path="/" element={<App />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/screener/:screenerName" element={<IndividualScreenPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);