import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist } from "./utils/watchlistActions";
import { useAuth } from "./Context/AuthContext";
import NavigationBar from "./Components/NavigationBar";
import { useWatchlistStatus } from "./useWatchlistStatus";
import { useFetchStockData } from "./useFetchStockData";

export interface StockData {
  currentPrice: number;
  displayName: string;
  symbol: string;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  fiftyDayAverage: number;
  fullExchangeName: string;
  exchange: string;
  industry: string;
  sector: string;
  country: string;
  longName: string;
  shortName: string;
}

const periods = [
  { label: "1 Day", value: "1d" },
  { label: "5 Days", value: "5d" },
  { label: "1 Month", value: "1mo" },
  { label: "6 Months", value: "6mo" },
  { label: "1 Year", value: "1y" },
  { label: "2 Years", value: "2y" },
];

const intervals = [
  { label: "5 Minutes", value: "5m" },
  { label: "15 Minutes", value: "15m" },
  { label: "30 Minutes", value: "30m" },
  { label: "1 Hour", value: "1h" },
  { label: "1 Day", value: "1d" },
  { label: "1 Week", value: "1wk" },
];

interface StockProps {
  token?: string;
}

export default function Stock({ token: propToken }: StockProps) {
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

  if (loading) return <div className="bg-[hsl(40,62%,26%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">Loading...</p></div>;
  if (!results) return <div className="bg-[hsl(40,62%,26%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">No stock data found.</p></div>;

  return (
    <div className="bg-[hsl(40,62%,26%)] min-h-screen" style={{ fontFamily: "serif" }}>
      <NavigationBar />
      <div className="main-content" style={{ padding: "20px" }}>
        <div className="flex gap-4 mt-2">
            <div>
              <label htmlFor="period" className="mr-2 font-semibold">Time Frame:</label>
              <select
                id="period"
                value={period}
                onChange={handlePeriodChange}
                className="rounded p-1"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

        <div>
          <label htmlFor="interval" className="mr-2 font-semibold">Interval:</label>
          <select
            id="interval"
            value={interval}
            onChange={handleIntervalChange}
            className="rounded p-1"
          >
            {intervals.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
      </div>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '12px',
            right: '12px',
            background: '#2d2d2d',
            color: '#EBCB92',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
            zIndex: 2000,
          }}
        >
          {toast}
        </div>
      )}
      <button 
        onClick={() => window.history.back()}
        className="nav-button mb-4"
      >
        ← Back
      </button>
      <div className="mt-8">
        <h2 className="text-[hsl(40,66%,60%)]">{results.displayName} ({results.symbol})</h2>
        <div style={{ marginTop: '0.75rem' }}>
          {apiKey && (
            <button
              onClick={inWatchlist ? handleRemove : handleAdd}
              disabled={pending}
              className="px-4 py-2 rounded"
              style={{
                background: inWatchlist ? '#883939' : '#3a6c3a',
                color: '#EBCB92',
                opacity: pending ? 0.7 : 1,
              }}
              aria-label={`${inWatchlist ? 'Remove' : 'Add'} ${results.symbol} ${inWatchlist ? 'from' : 'to'} watchlist`}
            >
              {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
          )}
        </div>
        <p className="text-[hsl(40,66%,60%)]"><strong>Current Price:</strong> ${results.currentPrice}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Open:</strong> ${results.open}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Previous Close:</strong> ${results.previousClose}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Day High / Low:</strong> ${results.dayHigh} / ${results.dayLow}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>50-Day Average:</strong> ${results.fiftyDayAverage.toFixed(2)}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Exchange:</strong> {results.fullExchangeName} ({results.exchange})</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Industry:</strong> {results.industry}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Sector:</strong> {results.sector}</p>
        <p className="text-[hsl(40,66%,60%)]"><strong>Country:</strong> {results.country}</p>
        <img
          src={imgUrl}
          alt={`${token} stock chart`}
          className="rounded-lg shadow-md max-w-full h-auto grid-middle mt-4"
        />
        </div>
      </div>
    </div>
  );
}
