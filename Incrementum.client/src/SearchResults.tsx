import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "./searchBar";
import StockCard from "./StockCard";

export default function SearchResults() {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0); // current page
  const [hasMore, setHasMore] = useState(true); // flag to disable next button

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/searchStocks/${query}/${page}`);
        const data = await res.json();

        setResults(data);
        setHasMore(data.length >= 10); // if empty, no more pages
      } catch (err) {
        console.error("Error fetching search results:", err);
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
    <div style={{ padding: "20px", fontFamily: "serif" }}>
      <SearchBar />
      <h2>Results for "{query}"</h2>
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
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!hasMore}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
