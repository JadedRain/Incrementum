import { useState, useEffect } from 'react';

export function useBulkStockData(initialTickers: string[], apiKey?: string | null) {
  const [tickers, setTickers] = useState<string[]>(initialTickers);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTickers(initialTickers);
  }, [initialTickers.join(',')]);

  useEffect(() => {
    if (!tickers || tickers.length === 0) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/stocks/bulk/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-User-Id': apiKey } : {})
      },
      body: JSON.stringify({ tickers })
    })
      .then(res => res.json())
      .then(json => {
        if (json.stocks) {
          setData(json.stocks);
        } else {
          setError(json.error || 'Unknown error');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tickers.join(','), apiKey]);

  const updateTickers = (newTickers: string[]) => {
    setTickers(newTickers);
  };

  return { data, loading, error, updateTickers };
}
