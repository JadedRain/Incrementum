import { useState, useEffect, useCallback } from "react";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export interface Stock {
  symbol: string;
  name: string;
}

export function useStockSearch(query: string) {
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetchWrapper(()=>fetch(apiString(`/searchStocks/${query}/${page}`)));
        const data = await res.json();

        const symbolMatches = data.filter(
          (stock: Stock) => stock.symbol && stock.symbol.toLowerCase().startsWith(query.toLowerCase())
        );
        const nameMatches = data.filter(
          (stock: Stock) =>
            (!stock.symbol || !stock.symbol.toLowerCase().startsWith(query.toLowerCase())) &&
            stock.name && stock.name.toLowerCase().includes(query.toLowerCase())
        );
  const PAGE_SIZE = 7;
        const combined = [...symbolMatches, ...nameMatches];
        const start = page * PAGE_SIZE;
        const paged = combined.slice(start, start + PAGE_SIZE);
        setResults(paged);

        // compute total pages from the full combined result set
        const total = combined.length;
        const pages = total > 0 ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 0;
        setTotalPages(pages);

        if (paged.length === 0) {
          setHasMore(false);
          if (page > 0) {
            setPage((p) => p - 1);
          }
          return;
        }

        const moreFromFullSet = combined.length > start + PAGE_SIZE;
        setHasMore(moreFromFullSet);
      } catch (err) {
        console.error('[useStockSearch] Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  const handleNext = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      const nextPage = page + 1;
      const resNext = await fetchWrapper(()=>fetch(apiString(`/searchStocks/${query}/${nextPage}`)));
      const dataNext = await resNext.json();

      const symbolMatchesNext = dataNext.filter(
        (stock: Stock) => stock.symbol && stock.symbol.toLowerCase().startsWith(query.toLowerCase())
      );
      const nameMatchesNext = dataNext.filter(
        (stock: Stock) =>
          (!stock.symbol || !stock.symbol.toLowerCase().startsWith(query.toLowerCase())) &&
          stock.name && stock.name.toLowerCase().includes(query.toLowerCase())
      );
      const combinedNext = [...symbolMatchesNext, ...nameMatchesNext];

      if (combinedNext.length > 0) {
        setPage((p) => p + 1);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
  }, [hasMore, loading, page, query]);

  const handlePrev = useCallback(() => {
    if (page > 0) setPage((prev: number) => prev - 1);
  }, [page]);

  return { results, loading, page, hasMore, totalPages, handleNext, handlePrev };
}