import { useState, useEffect, useCallback } from "react";

export interface Stock {
  symbol: string;
  name: string;
}

export function useStockSearch(query: string) {
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/searchStocks/${query}/${page}`);
        const data = await res.json();

        const symbolMatches = data.filter(
          (stock: Stock) => stock.symbol && stock.symbol.toLowerCase().startsWith(query.toLowerCase())
        );
        const nameMatches = data.filter(
          (stock: Stock) =>
            (!stock.symbol || !stock.symbol.toLowerCase().startsWith(query.toLowerCase())) &&
            stock.name && stock.name.toLowerCase().includes(query.toLowerCase())
        );
        const combined = [...symbolMatches, ...nameMatches];
        setResults(combined);
        setHasMore(combined.length === 12);
      } catch (err) {
        console.error('[useStockSearch] Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  const handleNext = useCallback(() => {
    if (hasMore) setPage((prev: number) => prev + 1);
  }, [hasMore]);

  const handlePrev = useCallback(() => {
    if (page > 0) setPage((prev: number) => prev - 1);
  }, [page]);

  return { results, loading, page, hasMore, handleNext, handlePrev };
}