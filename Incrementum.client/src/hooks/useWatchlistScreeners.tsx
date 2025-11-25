import { useState, useEffect } from 'react';
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export function useWatchlistScreeners(apiKey: string | null) {
  const [watchlistScreenerIds, setWatchlistScreenerIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWatchlistScreeners = async () => {
      if (!apiKey) {
        setWatchlistScreenerIds(new Set());
        return;
      }

      setLoading(true);
      try {
        const res = await fetchWrapper(fetch(apiString('/watchlist/screeners/all/'), { 
          headers: { 'X-User-Id': apiKey } 
        }));
        
        if (!res.ok) {
          throw new Error('Failed to fetch watchlist screeners');
        }
        
        type Screener = { id?: number };
        const data = (await res.json()) as { custom_screeners?: Screener[] | undefined };
        const ids = new Set<number>(
          (data.custom_screeners || [])
            .map((s: Screener) => s.id)
            .filter((id): id is number => typeof id === 'number')
        );
        setWatchlistScreenerIds(ids);
      } catch (err) {
        console.error('Error fetching watchlist screeners:', err);
        setWatchlistScreenerIds(new Set());
      } finally {
        setLoading(false);
      }
    };
    
    fetchWatchlistScreeners();
  }, [apiKey]);

  return { watchlistScreenerIds, setWatchlistScreenerIds, loading };
}
