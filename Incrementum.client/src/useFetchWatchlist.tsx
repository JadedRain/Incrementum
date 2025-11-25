import { useState, useEffect } from 'react';
import { apiString, fetchWrapper } from "./Context/FetchingHelper";

export function useFetchWatchlist(apiKey: string | null) {
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!apiKey) {
        setWatchlistSymbols(new Set());
        return;
      }
      
      const res = await fetchWrapper(()=>fetch(apiString('/watchlist/'), { 
        credentials: 'include',
        headers: {
          'X-User-Id': apiKey,
        }
      }));
      if (!res.ok) return;
      const data = await res.json();
      type WatchlistItem = { symbol?: unknown };
      const rawList = Array.isArray(data.watchlist) ? data.watchlist : [];
      const symbols = new Set<string>(
        rawList
          .map((s: unknown) => (s as WatchlistItem).symbol)
          .filter((s: unknown): s is string => typeof s === 'string')
      );
      setWatchlistSymbols(symbols);
    };
    fetchWatchlist();
  }, [apiKey]);

  return { watchlistSymbols, setWatchlistSymbols };
}