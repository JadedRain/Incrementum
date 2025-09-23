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
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;

  const [results, setResults] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("1y");
  const [interval, setInterval] = useState("1d");

  const imgUrl = `http://localhost:8000/getStocks/${token}/?period=${period}&interval=${interval}`;

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

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(e.target.value);
  };

  if (loading) return <p>Loading...</p>;
  if (!results) return <p>No stock data found.</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "serif" }} className="bg-[#6C5019]">
      <div className="stock-grid">
        <div className='StocksPage-header grid-top'>
          <h1 className="StocksPage-h1">{results.shortName} ({results.symbol})</h1>

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

        <img
          src={imgUrl}
          alt={`${token} stock chart`}
          className="rounded-lg shadow-md max-w-full h-auto grid-middle mt-4"
        />
      </div>
    </div>
  );
}
