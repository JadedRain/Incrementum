import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../Components/NavigationBar";
import StockCard from "../StockCard";


interface Stock {
  symbol: string;
  name: string;
  // Add other fields if needed
}

export default function SearchResults() {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0); // current page
  const [hasMore, setHasMore] = useState(true); // flag to disable next button

  useEffect(() => {
    console.log('[SearchResults] useEffect triggered. query:', query, 'page:', page);
    if (!query) {
      console.log('[SearchResults] No query provided, skipping fetch.');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        console.log(`[SearchResults] Sending request to /searchStocks/${query}/${page}`);
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
        console.log('[SearchResults] Query:', query);
        console.log('[SearchResults] Symbol Matches:', symbolMatches);
        console.log('[SearchResults] Name Matches:', nameMatches);
        setResults([...symbolMatches, ...nameMatches]);
        setHasMore([...symbolMatches, ...nameMatches].length === 10);
      } catch (err) {
        console.error('[SearchResults] Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page]);

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage((prev) => prev - 1);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "serif" }}
         className="bg-[#6C5019] min-h-screen">
      <NavigationBar />
      <div className="main-content">
        <h1 className="StocksPage-h1">
          Search Results
        </h1>
        <h2 className="text-[#DABB7C]">Results for "{query}"</h2>
      {loading && <p>Loading...</p>}
      {!loading && results.length === 0 && <p>No results found.</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map((stock) => (
          <li key={stock.symbol}>
            <StockCard symbol={stock.symbol} name={stock.name} />
          </li>
        ))}
      </ul>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="pagination-button"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!hasMore}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
