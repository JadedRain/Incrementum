import { useState, useEffect } from 'react';
import { apiString, fetchWrapper } from "./Context/FetchingHelper";
import { type StockInfo } from './Types/StockInfoTypes';

export function useFetchStocks() {
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetchWrapper(()=>fetch(apiString('/getStockInfo/')));
        const data = await response.json();
        const mappedStocks = data.stocks.slice(0, 11).map((stock: StockInfo) => ({
          ...stock,
        }));
        setStocks(mappedStocks);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  return { stocks, loading };
}