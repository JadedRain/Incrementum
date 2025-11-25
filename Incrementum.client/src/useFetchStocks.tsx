import { useState, useEffect } from 'react';
import { apiString, fetchWrapper } from "./Context/FetchingHelper";

interface StockInfo {
  [key: string]: unknown;
  displayName?: string;
  longName?: string;
  shortName?: string;
  symbol?: string;
}

export function useFetchStocks() {
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetchWrapper(fetch(apiString('/getStockInfo/')));
        const data = await response.json();
        setStocks(data.stocks.slice(0, 11));
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  return { stocks, loading };
}