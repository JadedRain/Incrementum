import '../styles/SearchBar.css'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../Components/BackButton';

const CreateCustomCollectionPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newToken, setNewToken] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [defaultNameNumber, setDefaultNameNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // TODO: Replace with real authentication check
  const isAuthenticated = true;

  useEffect(() => {
    // Get the next default name number from localStorage
    const storedNum = localStorage.getItem('customCollectionNameNumber');
    let num = 1;
    if (storedNum) {
      num = parseInt(storedNum, 10);
      if (isNaN(num) || num < 1) num = 1;
    }
    setDefaultNameNumber(num);
  }, []);


  // Search for stocks by symbol or name
  const searchStocks = async () => {
    if (!newToken.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      // Use your backend search endpoint, adjust as needed
      const res = await fetch(`http://localhost:8000/searchStocks/${encodeURIComponent(newToken)}/0/`);
      if (!res.ok) throw new Error("Failed to search stocks");
      const data = await res.json();
      setSearchResults(data.results || data || []);
    } catch (err: any) {
      setError("Search: " + err.message);
    }
    setSearching(false);
  };

  // Add selected stock symbol to collection
  const addToken = (symbol: string) => {
    if (!selectedStocks.includes(symbol)) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
    setSearchResults([]);
    setNewToken('');
  };


  const handleStockRemove = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s !== symbol));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
    let finalName = name.trim() || `name ${defaultNameNumber}`;
    if (selectedStocks.length === 0) {
      setError('Please select at least one stock.');
      setLoading(false);
      return;
    }
    // Create a fake new collection object
    const newCollection = {
      id: Date.now(),
      name: finalName,
      description,
      stocks: selectedStocks,
    };
    // Save to localStorage (simulate API)
    const updated = [...collections, newCollection];
    localStorage.setItem('customCollections', JSON.stringify(updated));
  // Increment default name number for next time
  localStorage.setItem('customCollectionNameNumber', String(defaultNameNumber + 1));
  setDefaultNameNumber(defaultNameNumber + 1);
    setLoading(false);
    // Redirect to custom collections page
    navigate('/custom-collections');
  };

  if (!isAuthenticated) {
    // TODO: Redirect to login or show message
    return <div>Please log in to create a custom collection.</div>;
  }


  return (
    <div className="max-w-xl mx-auto p-4">
        <header className="WatchlistPage-header flex items-center justify-center py-6 ">
            <BackButton onClick={() => navigate(-1)} />
            <h1 className="WatchlistPage-h1"> 
                Create Custom Collection 
            </h1>
        </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            className="search-bar"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`name ${defaultNameNumber}`}
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            className="search-bar"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your collection..."
          />
        </div>
        <div>
          <label className="block font-medium">Add Stocks</label>
          <div className="flex mb-2">
            <input
              className="search-bar newsreader-font flex-1"
              type="text"
              placeholder="Search by symbol or name"
              value={newToken}
              onChange={e => setNewToken(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') searchStocks(); }}
            />
            <button className="ScreenerPage-button ml-2" type="button" onClick={searchStocks} disabled={searching}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <ul className="bg-white rounded shadow p-2 mb-2 max-h-40 overflow-y-auto">
              {searchResults.map((stock, idx) => (
                <li key={stock.symbol || idx} className="flex justify-between items-center py-1 border-b last:border-b-0">
                  <span>{stock.symbol} - {stock.name || stock.longName || ''}</span>
                  <button className="px-2 py-1 bg-green-500 text-white rounded" type="button" onClick={() => addToken(stock.symbol)}>Add</button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2">
            {selectedStocks.map(symbol => (
              <span key={symbol} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                {symbol}
                <button type="button" className="ml-1 text-red-500" onClick={() => handleStockRemove(symbol)}>&times;</button>
              </span>
            ))}
          </div>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading || selectedStocks.length === 0}
        >
          {loading ? 'Saving...' : 'Save Collection'}
        </button>
      </form>
    </div>
  );
};

export default CreateCustomCollectionPage;
