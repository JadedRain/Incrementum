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

  if (loading) return <div className="bg-[hsl(40,62%,26%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">Loading...</p></div>;
  if (!results) return <div className="bg-[hsl(40,62%,26%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">No stock data found.</p></div>;

  return (
    <div className="bg-[hsl(40,62%,26%)] min-h-screen" style={{ padding: "20px", fontFamily: "serif" }}>
      <BackButton onClick={() => window.history.back()} />
      <div className="mt-8">
        <h2 className="text-[hsl(40,66%,60%)]">{results.displayName} ({results.symbol})</h2>
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
