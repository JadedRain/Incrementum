import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../Components/SearchBar";
import StockCard from "../StockCard";


interface Stock {
  symbol: string;
  name: string;
  // Add other fields if needed
}

export default function SearchResults() {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<Stock[]>([]);
  const navigate = useNavigate();
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

        // Prioritize symbol matches, then name matches
        const symbolMatches = data.filter(
          (stock: Stock) => stock.symbol && stock.symbol.toLowerCase().startsWith(query.toLowerCase())
        );
        const nameMatches = data.filter(
          (stock: Stock) =>
            (!stock.symbol || !stock.symbol.toLowerCase().startsWith(query.toLowerCase())) &&
            stock.name && stock.name.toLowerCase().includes(query.toLowerCase())
        );
        console.log('Query:', query);
        console.log('Symbol Matches:', symbolMatches);
        console.log('Name Matches:', nameMatches);
        setResults([...symbolMatches, ...nameMatches]);
        setHasMore([...symbolMatches, ...nameMatches].length === 10); // if empty, no more pages
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
    <div style={{ padding: "20px", fontFamily: "serif" }}
         className="bg-[#6C5019] min-h-screen">
      <div className='SearchPage-header'>
        <button 
        onClick={() => navigate('/watchlist')}
        className="nav-button">
          Watchlist 
        </button>
        <h1 className="StocksPage-h1">
          Search Results
        </h1>
      </div>
      <SearchBar />
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
  );
}
