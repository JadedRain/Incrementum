import { useState, useEffect } from 'react';

export function useFetchWatchlist(apiKey: string | null) {
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!apiKey) {
        setWatchlistSymbols(new Set());
        return;
      }
      
      const res = await fetch('/watchlist/', { 
        credentials: 'include',
        headers: {
          'X-User-Id': apiKey,
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      const symbols = new Set<string>((data.watchlist || []).map((s: any) => s.symbol).filter((s: any) => typeof s === 'string'));
      setWatchlistSymbols(symbols);
    };
    fetchWatchlist();
  }, [apiKey]);

  return { watchlistSymbols, setWatchlistSymbols };
}