import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

type WatchlistItem = {
  symbol?: string | null;
};

export function useWatchlistStatus(token: string | undefined) {
  const { apiKey } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  useEffect(() => {
    if (!token || !apiKey) return;
    const checkWatchlist = async () => {
      const res = await fetchWrapper(()=>fetch(apiString('/watchlist/'), {
        credentials: 'include',
        headers: { 'X-User-Id': apiKey },
      }));
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.watchlist) ? (data.watchlist as WatchlistItem[]) : [];
      const present = list.some((it: WatchlistItem) => ((it?.symbol ?? '').toUpperCase() === token.toUpperCase()));
      setInWatchlist(present);
    };
    checkWatchlist();
  }, [token, apiKey]);
  return { inWatchlist, setInWatchlist };
}