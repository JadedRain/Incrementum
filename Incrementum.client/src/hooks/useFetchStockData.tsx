import { useState, useEffect } from "react";
import type { StockData } from "./Types/Stock";

export function useFetchStockData(token: string | undefined) {
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
  return { results, loading };
}
