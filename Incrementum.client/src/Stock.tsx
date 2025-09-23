import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "./Components/BackButton";

interface StockData {
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

export default function Stock() {
  const { token } = useParams<{ token: string }>();
  const [results, setResults] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const imgUrl = `http://localhost:8000/getStocks/${token}/`;
  useEffect(() => {
    if (!token) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/stock/${token}/`);
        const data: StockData = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const checkWatchlist = async () => {
      try {
        const res = await fetch('/watchlist/', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.watchlist) ? data.watchlist : [];
        const present = list.some((it: any) => (it?.symbol || '').toUpperCase() === token.toUpperCase());
        setInWatchlist(present);
      } catch {
        // ignore
      }
    };
    checkWatchlist();
  }, [token]);

  const handleAdd = async () => {
    if (!token || pending) return;
    try {
      setPending(true);
      const res = await fetch('/watchlist/add/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol: token }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setToast(`Failed to add ${token}: ${msg || 'request error'}`);
        setTimeout(() => setToast(null), 2500);
        return;
      }
      await res.json();
      setInWatchlist(true);
      setToast(`Successfully added ${token} to watchlist`);
      setTimeout(() => setToast(null), 2000);
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async () => {
    if (!token || pending) return;
    try {
      setPending(true);
      const res = await fetch('/watchlist/remove/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol: token }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setToast(`Failed to remove ${token}: ${msg || 'request error'}`);
        setTimeout(() => setToast(null), 2500);
        return;
      }
      await res.json();
      setInWatchlist(false);
      setToast(`Removed ${token} from watchlist`);
      setTimeout(() => setToast(null), 2000);
    } finally {
      setPending(false);
    }
  };

  if (loading) return <div className="bg-[hsl(40,62%,26%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">Loading...</p></div>;
  if (!results) return <div className="bg-[hsl(40,62%,26%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">No stock data found.</p></div>;

  return (
    <div className="bg-[hsl(40,62%,26%)] min-h-screen" style={{ padding: "20px", fontFamily: "serif" }}>
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
      <BackButton onClick={() => window.history.back()} />
      <div className="mt-8">
        <h2 className="text-[hsl(40,66%,60%)]">{results.displayName} ({results.symbol})</h2>
        <div style={{ marginTop: '0.75rem' }}>
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
      </div>
    </div>
  );
}
