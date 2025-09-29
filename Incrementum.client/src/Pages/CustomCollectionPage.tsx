import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CustomCollectionPage: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [aggregate, setAggregate] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [newToken, setNewToken] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [graphKey, setGraphKey] = useState<number>(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    fetch("http://localhost:8000/custom-collection/")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch stocks");
        return res.json();
      })
      .then(data => setTokens(data.tokens || []))
      .catch(err => setError("Stocks: " + err.message));
    // Aggregate fetch (if needed)
    fetch("http://localhost:8000/custom-collection/aggregate/")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch aggregate");
        return res.json();
      })
      .then(data => setAggregate(data.aggregate))
      .catch(err => setError(prev => prev + "\nAggregate: " + err.message));
  }, []);


  // Helper to refresh tokens and aggregate
  const refreshCollection = async () => {
    try {
      const tokensRes = await fetch("http://localhost:8000/custom-collection/");
      const tokensData = await tokensRes.json();
      setTokens(tokensData.tokens || []);
      const aggRes = await fetch("http://localhost:8000/custom-collection/aggregate/");
      const aggData = await aggRes.json();
      setAggregate(aggData.aggregate);
      setGraphKey(Date.now()); // update graphKey to force image reload
    } catch (err: any) {
      setError("Refresh: " + err.message);
    }
  };


  // Search for stocks by symbol or name
  const searchStocks = async () => {
    if (!newToken) return;
    setSearching(true);
    setSearchResults([]);
    setError("");
    try {
      // Use your backend search endpoint, adjust as needed
      const res = await fetch(`http://localhost:8000/searchStocks/${encodeURIComponent(newToken)}/0/`);
      if (!res.ok) throw new Error("Failed to search stocks");
      const data = await res.json();
      setSearchResults(data.results || data || []);
    } catch (err: any) {
      setError("Search: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Add selected stock symbol to collection
  const addToken = async (tokenOverride?: string) => {
    const token = tokenOverride || newToken;
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/custom-collection/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!res.ok) throw new Error("Failed to add stock");
      setNewToken("");
      setSearchResults([]);
      await refreshCollection();
    } catch (err: any) {
      setError("Add: " + err.message);
    }
  };

  const removeToken = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8000/custom-collection/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!res.ok) throw new Error("Failed to remove stock");
      await refreshCollection();
    } catch (err: any) {
      setError("Remove: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate("/screener")}>Back to Screener</button>
      <h1 className="text-2xl font-bold mb-6">Custom Collection</h1>
      <div className="mb-6 w-full max-w-md">
        <div className="flex mb-2">
          <input
            className="border px-2 py-1 w-2/3 rounded mr-2"
            type="text"
            placeholder="Search by symbol or name"
            value={newToken}
            onChange={e => setNewToken(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') searchStocks(); }}
          />
          <button className="px-4 py-1 bg-blue-500 text-white rounded mr-2" onClick={searchStocks} disabled={searching}>Search</button>
        </div>
        {searchResults.length > 0 && (
          <ul className="bg-white rounded shadow p-2 mb-2 max-h-40 overflow-y-auto">
            {searchResults.map((stock, idx) => (
              <li key={stock.symbol || idx} className="flex justify-between items-center py-1 border-b last:border-b-0">
                <span>{stock.symbol} - {stock.name || stock.longName || ''}</span>
                <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => addToken(stock.symbol)}>Add</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-full max-w-md mb-8">
        <h2 className="text-lg font-semibold mb-2">Stocks in Collection:</h2>
        <ul className="bg-white rounded shadow p-4">
          {tokens.map(token => (
            <li key={token} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span>{token}</span>
              <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => removeToken(token)}>Remove</button>
            </li>
          ))}
          {tokens.length === 0 && <li className="text-gray-500">No stocks in collection.</li>}
        </ul>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Aggregate Graph (Overlay):</h2>
        <div className="bg-white rounded shadow p-4 min-h-[200px] flex items-center justify-center">
          <img
            src={`http://localhost:8000/custom-collection/overlay-graph/?_=${graphKey}`}
            alt="Overlay aggregate graph"
            className="rounded-lg shadow-md max-w-full h-auto"
            style={{ minHeight: '200px', minWidth: '300px' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        {error && <div className="text-red-500 mt-2 whitespace-pre-line">{error}</div>}
      </div>
    </div>
  );
};

export default CustomCollectionPage;
