import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SearchResults() {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/searchStocks/${query}/`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div style={{ padding: "20px", fontFamily: "serif" }}>
      <h2>Results for "{query}"</h2>
      {loading && <p>Loading...</p>}
      {!loading && results.length === 0 && <p>No results found.</p>}
      <ul>
        {results.map((stock, i) => (
          <li key={i}>{JSON.stringify(stock)}</li>
        ))}
      </ul>
    </div>
  );
}
