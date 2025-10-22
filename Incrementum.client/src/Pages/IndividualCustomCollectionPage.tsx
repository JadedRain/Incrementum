import '../styles/Collections/IndividualCustomCollectionPage.css'
import '../styles/SearchBar.css'
import React, { useEffect, useState } from "react";
import Loading from "../Components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../Components/BackButton";

const IndividualCustomCollectionPage: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [aggregate, setAggregate] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [newToken, setNewToken] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [graphKey, setGraphKey] = useState<number>(Date.now());
  const [collectionName, setCollectionName] = useState<string>("My Custom Collection");
  const [graphLoading, setGraphLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editNameMode, setEditNameMode] = useState<boolean>(false);
  const [pendingName, setPendingName] = useState<string>("My Custom Collection");
  const navigate = useNavigate();
  const { id } = useParams();

  // Get collection id from route param or fallback to latest
  useEffect(() => {
    let collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
    let collection;
    if (id) {
      collection = collections.find((c: any) => String(c.id) === String(id));
    } else {
      // fallback to last created
      collection = collections[collections.length - 1];
    }
    if (collection) {
      setTokens(collection.stocks || []);
      setCollectionName(collection.name || "My Custom Collection");
      setPendingName(collection.name || "My Custom Collection");
    }
  }, [id]);


  // No backend fetches; handled by localStorage effect below

  // For demo: compute a fake aggregate from tokens
  useEffect(() => {
    if (tokens.length > 0) {
      // Example: just count the tokens, or make a fake data structure
      setAggregate({ count: tokens.length, tokens });
    } else {
      setAggregate(null);
    }
  }, [tokens]);


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
    <div className="min-h-screen bg-[hsl(40,13%,53%)] flex flex-col items-center p-8">
      <div className="IndividualCustomCollectionPage-header relative">
        <BackButton onClick={() => navigate(-1)}></BackButton>
        <h1 className="IndividualCustomCollectionPage-h1">{collectionName}</h1>
      </div>
      <div className="flex items-center mb-6">
        {editNameMode ? (
          <>
            <input
              className="search-bar newsreader-font"
              value={pendingName}
              onChange={e => setPendingName(e.target.value)}
              autoFocus
            />
            <button
              className="IndividualCustomCollectionPage-button"
              onClick={() => {
                setCollectionName(pendingName);
                // Update the collection name in localStorage
                const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
                if (id) {
                  const idx = collections.findIndex((c: any) => String(c.id) === String(id));
                  if (idx !== -1) {
                    collections[idx].name = pendingName;
                    localStorage.setItem('customCollections', JSON.stringify(collections));
                  }
                }
                setEditNameMode(false);
              }}
            >Save</button>
            <button
              className="IndividualCustomCollectionPage-button"
              onClick={() => { setPendingName(collectionName); setEditNameMode(false); }}
            >Cancel</button>
          </>
        ) : (
          <>
            <button
              className="IndividualCustomCollectionPage-button"
              onClick={() => setEditMode(e => !e)}
            >{editMode ? 'Done' : 'Edit'}</button>
            {editMode && (
              <button
                className="IndividualCustomCollectionPage-button"
                onClick={() => setEditNameMode(true)}
              >Edit Name</button>
            )}
          </>
        )}
      </div>
      <div className="mb-6 w-full max-w-md">
        {editMode && (
          <>
            <div className="flex mb-2">
              <input
                className="search-bar newsreader-font"
                type="text"
                placeholder="Search by symbol or name"
                value={newToken}
                onChange={e => setNewToken(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') searchStocks(); }}
              />
              <button className="IndividualCustomCollectionPage-button" onClick={searchStocks} disabled={searching}>Search</button>
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
          </>
        )}
      </div>
      <div className="w-full max-w-2xl mb-8">
        <div className="StockTable-container">
          {tokens.length === 0 && (
            <div className="StockTable-row">
              <div className="StockTable-cell text-gray-500">No stocks in collection.</div>
              <div className="StockTable-cell"></div>
            </div>
          )}
          {tokens.map(token => (
            <div key={token} className="StockTable-row">
              <div className="StockTable-cell">{token}</div>
              <div className="StockTable-cell">
                {editMode && (
                  <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => removeToken(token)}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-[hsl(40,66%,60%)] text-lg font-semibold mb-2">Aggregate Graph (Overlay):</h2>
        <div className="bg-[hsl(40,13%,53%)] rounded shadow p-4 min-h-[200px] flex items-center justify-center">
          {graphLoading && (
            <Loading loading={true}/>
          )}
          <img
            src={`http://localhost:8000/custom-collection/overlay-graph/?_=${graphKey}`}
            alt="Overlay aggregate graph"
            className="rounded-lg shadow-md max-w-full h-auto"
            style={{ minHeight: '200px', minWidth: '300px', display: graphLoading ? 'none' : 'block' }}
            onLoad={() => setGraphLoading(false)}
            onError={e => { setGraphLoading(false); e.currentTarget.style.display = 'none'; }}
          />
        </div>
        {error && <div className="text-red-500 mt-2 whitespace-pre-line">{error}</div>}
      </div>
    </div>
  );
};

export default IndividualCustomCollectionPage;
