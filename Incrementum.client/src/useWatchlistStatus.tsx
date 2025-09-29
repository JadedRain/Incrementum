import { useState, useEffect } from "react";

export function useWatchlistStatus(token: string | undefined) {
  const [inWatchlist, setInWatchlist] = useState(false);
  useEffect(() => {
    if (!token) return;
    const checkWatchlist = async () => {
      const apiKey = localStorage.getItem('apiKey');
      const res = await fetch('/watchlist/', {
        credentials: 'include',
        headers: apiKey ? { 'X-User-Id': apiKey } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.watchlist) ? data.watchlist : [];
      const present = list.some((it: any) => (it?.symbol || '').toUpperCase() === token.toUpperCase());
      setInWatchlist(present);
    };
    checkWatchlist();
  }, [token]);
  return { inWatchlist, setInWatchlist };
}
