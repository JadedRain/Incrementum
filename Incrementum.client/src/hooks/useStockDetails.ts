import { useState, useEffect } from 'react';

export const useStockDetails = (tokens: string[]) => {
  const [stocksData, setStocksData] = useState<any[]>([]);
  const [loadingStocks, setLoadingStocks] = useState<boolean>(false);

  useEffect(() => {
    const fetchStockDetails = async () => {
      if (tokens.length === 0) {
        setStocksData([]);
        return;
      }
      
      setLoadingStocks(true);
      try {
        const promises = tokens.map(symbol => 
          fetch(`http://localhost:8000/stock/${symbol}/`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        const results = await Promise.all(promises);
        setStocksData(results.filter(r => r !== null));
      } catch (err: any) {
        console.error("Failed to fetch stock details:", err.message);
      } finally {
        setLoadingStocks(false);
      }
    };
    
    fetchStockDetails();
  }, [tokens]);

  return { stocksData, loadingStocks };
};
