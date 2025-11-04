import '../styles/NavBar.css'
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist } from "../utils/watchlistActions";
import { useAuth } from "../Context/AuthContext";
import NavigationBar from "../Components/NavigationBar";
import Toast from "../Components/Toast";
import StockDataDisplay from "../Components/StockDataDisplay";
import ChartControls from "../Components/ChartControls";
import { useWatchlistStatus } from "../hooks/useWatchlistStatus";
import { useFetchStockData } from "../hooks/useFetchStockData";
import { FilterDataProvider } from '../Context/FilterDataContext';

export default function Stock({ token: propToken }: { token?: string; }) {
  const { apiKey } = useAuth();
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;
  const { results, loading } = useFetchStockData(token);
  const { inWatchlist, setInWatchlist } = useWatchlistStatus(token);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [period, setPeriod] = useState("1y");
  const [interval, setInterval] = useState("1d");

  const imgUrl = `http://localhost:8000/getStocks/${token}/?period=${period}&interval=${interval}`;

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(e.target.value);
  };

  const handleAdd = async () => {
    if (!token || pending) return;
    await addToWatchlist(token, apiKey, setPending, setToast, setInWatchlist);
  };

  const handleRemove = async () => {
    if (!token || pending) return;
    await removeFromWatchlist(token, apiKey, setPending, setToast, setInWatchlist);
  };

  if (loading) return <div className="bg-[hsl(40,13%,53%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">Loading...</p></div>;
  if (!results) return <div className="bg-[hsl(40,13%,53%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">No stock data found.</p></div>;

  return (
    <FilterDataProvider>
    <div className="bg-[hsl(40,13%,53%)] min-h-screen" style={{ fontFamily: "serif" }}>
      <NavigationBar />
      <div className="main-content" style={{ padding: "20px" }}>
      <Toast message={toast} />
      <button 
        onClick={() => window.history.back()}
        className="back-button mb-4"
      >
        ← Back
      </button>
      <StockDataDisplay
        results={results}
        apiKey={apiKey}
        inWatchlist={inWatchlist}
        pending={pending}
        onAddToWatchlist={handleAdd}
        onRemoveFromWatchlist={handleRemove}
        imgUrl={imgUrl}
        token={token}
      />
<ChartControls
  period={period}
  interval={interval}
  onPeriodChange={handlePeriodChange}
  onIntervalChange={handleIntervalChange}
/>
      </div>
    </div>
    </FilterDataProvider>
  );
}