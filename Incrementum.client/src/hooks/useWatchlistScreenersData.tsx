import { useState, useEffect } from 'react';
import { fetchWrapper } from "../Context/FetchingHelper";

interface WatchlistScreener {
  id: number;
  screener_name: string;
  filter_count: number;
  created_at: string;
}

export function useWatchlistScreenersData(apiKey: string | null) {
  const [watchlistScreeners, setWatchlistScreeners] = useState<WatchlistScreener[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWatchlistScreeners = async () => {
      if (!apiKey) {
        setWatchlistScreeners([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetchWrapper(fetch('/watchlist/screeners/all/', { 
          headers: { 'X-User-Id': apiKey } 
        }));
        
        if (!res.ok) {
          throw new Error('Failed to fetch watchlist screeners');
        }
        
        const data = await res.json();
        setWatchlistScreeners(data.custom_screeners || []);
      } catch (err) {
        console.error('Error fetching watchlist screeners:', err);
        setWatchlistScreeners([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWatchlistScreeners();
  }, [apiKey]);

  return { watchlistScreeners, setWatchlistScreeners, loading };
}
