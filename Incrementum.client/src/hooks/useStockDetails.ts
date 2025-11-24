import { fetchWrapper } from "../Context/FetchingHelper";
import { useState, useEffect, useRef } from 'react';

interface CollectionStock {
  symbol: string;
  [key: string]: unknown;
}

export const useStockDetails = (tokens: string[]) => {
  const [stocksData, setStocksData] = useState<CollectionStock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState<boolean>(false);
  const prevTokensRef = useRef<string[]>([]);

  useEffect(() => {
    const fetchStockDetails = async () => {
      // If tokens shrank (removal), update local state by filtering removed symbols
      const prev = prevTokensRef.current || [];
      if (tokens.length < prev.length) {
        const removed = prev.filter(t => !tokens.includes(t));
        if (removed.length > 0) {
          setStocksData((prevStocks) => prevStocks.filter(s => !removed.includes((s.symbol || '').toString())));
          // update prevTokens and skip network fetch
          prevTokensRef.current = [...tokens];
          setLoadingStocks(false);
          return;
        }
      }

      if (tokens.length === 0) {
        setStocksData([]);
        prevTokensRef.current = [];
        return;
      }

      setLoadingStocks(true);
      try {
        const promises = tokens.map(symbol => 
          fetchWrapper(fetch(`http://localhost:8000/stock/${symbol}/`))
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        const results = await Promise.all(promises);
        const filtered = results.filter(r => r !== null) as CollectionStock[];
        setStocksData(filtered);
        prevTokensRef.current = [...tokens];
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Failed to fetch stock details:", err.message);
        } else {
          console.error("Failed to fetch stock details:", String(err));
        }
      } finally {
        setLoadingStocks(false);
      }
    };

    fetchStockDetails();
  }, [tokens]);

  return { stocksData, loadingStocks };
};
