import { useState, useEffect } from "react";
import type { StockData } from "../StockData";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export function useFetchStockData(token: string | undefined) {
  const [results, setResults] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!token) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetchWrapper(()=>fetch(apiString(`/stock/${token}/metadata/`)));
        const data = await res.json();
        setResults(data as unknown as StockData);
      } catch (err) {
        console.error("Error fetching stock metadata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [token]);
  return { results, loading };
}
