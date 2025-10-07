import { useState, useEffect } from 'react';

interface StockInfo {
  [key: string]: any;
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
        const response = await fetch('/getStockInfo/');
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