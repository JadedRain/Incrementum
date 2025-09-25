import { useState, useEffect } from 'react';
import type { StockC } from '../Components/Stock';

export function useSortedWatchlist(sortBy: string) {
  const [watchlist, setWatchlist] = useState<StockC[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (sortBy === 'price_asc' || sortBy === 'price_desc') {
      setWatchlist(prev => {
        const sorted = [...prev].sort((a, b) => {
          const priceA = typeof a.currentPrice === 'number' ? a.currentPrice : -Infinity;
          const priceB = typeof b.currentPrice === 'number' ? b.currentPrice : -Infinity;
          return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
        });
        return sorted;
      });
      setLoading(false);
    } else if (sortBy === 'name') {
      setWatchlist(prev => {
        const sorted = [...prev].sort((a, b) => {
          const nameA = (a.shortName || a.displayName || '').toLowerCase();
          const nameB = (b.shortName || b.displayName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        return sorted;
      });
      setLoading(false);
    } else {
      const endpoint = sortBy === 'date_added'
        ? 'http://localhost:8000/watchlist/sorted/'
        : 'http://localhost:8000/watchlist/';
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          setWatchlist(data.watchlist || []);
          setLoading(false);
        })
        .catch(() => {
          setWatchlist([]);
          setLoading(false);
        });
    }
  }, [sortBy]);
  return { watchlist, setWatchlist, loading };
}
