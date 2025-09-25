import { useState, useEffect } from 'react';
import type { StockC } from '../Components/Stock';


function sortByPriceAsc(list: StockC[]) {
  return [...list].sort((a, b) => {
    const priceA = typeof a.currentPrice === 'number' ? a.currentPrice : -Infinity;
    const priceB = typeof b.currentPrice === 'number' ? b.currentPrice : -Infinity;
    return priceA - priceB;
  });
}

function sortByPriceDesc(list: StockC[]) {
  return [...list].sort((a, b) => {
    const priceA = typeof a.currentPrice === 'number' ? a.currentPrice : -Infinity;
    const priceB = typeof b.currentPrice === 'number' ? b.currentPrice : -Infinity;
    return priceB - priceA;
  });
}

function sortByName(list: StockC[]) {
  return [...list].sort((a, b) => {
    const nameA = (a.shortName || a.displayName || '').toLowerCase();
    const nameB = (b.shortName || b.displayName || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

function sortByRecentlyViewed(list: StockC[]) {
  return [...list].sort((a, b) => {
    if (b.lastViewed && a.lastViewed) return b.lastViewed - a.lastViewed;
    if (b.lastViewed) return 1;
    if (a.lastViewed) return -1;
    return 0;
  });
}

export function useSortedWatchlist(sortBy: string) {
  const [watchlist, setWatchlist] = useState<StockC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sortBy === 'price_asc') {
      setWatchlist(prev => sortByPriceAsc(prev));
      setLoading(false);
    } else if (sortBy === 'price_desc') {
      setWatchlist(prev => sortByPriceDesc(prev));
      setLoading(false);
    } else if (sortBy === 'name') {
      setWatchlist(prev => sortByName(prev));
      setLoading(false);
    } else if (sortBy === 'recently_viewed') {
      setWatchlist(prev => sortByRecentlyViewed(prev));
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
