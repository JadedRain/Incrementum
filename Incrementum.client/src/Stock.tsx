import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

  if (loading) return <p>Loading...</p>;
  if (!results) return <p>No stock data found.</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "serif" }} className="bg-[#6C5019]">
      <div className = "stock-grid">
        <div className='StocksPage-header grid-top'>
          <h1 className="StocksPage-h1">{results.displayName} ({results.symbol})</h1> 
        </div>
        <div className="grid-right">
          <p><strong>Current Price:</strong> ${results.currentPrice}</p>
          <p><strong>Open:</strong> ${results.open}</p>
          <p><strong>Previous Close:</strong> ${results.previousClose}</p>
          <p><strong>Day High / Low:</strong> ${results.dayHigh} / ${results.dayLow}</p>
          <p><strong>50-Day Average:</strong> ${results.fiftyDayAverage.toFixed(2)}</p>
          <p><strong>Exchange:</strong> {results.fullExchangeName} ({results.exchange})</p>
          <p><strong>Industry:</strong> {results.industry}</p>
          <p><strong>Sector:</strong> {results.sector}</p>
          <p><strong>Country:</strong> {results.country}</p>
        </div>
      </div>
    </div>
  );
}
