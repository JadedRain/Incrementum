import '../styles/Collections/IndividualCustomCollectionPage.css'
import '../styles/SearchBar.css'
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CollectionNameEditor from "../Components/CollectionNameEditor";
import StockSearchPanel from "../Components/StockSearchPanel";
import CollectionStockTable from "../Components/CollectionStockTable";
import { useAuth } from "../Context/AuthContext";
import NavigationBar from "../Components/NavigationBar";
import { useCustomCollection } from "../hooks/useCustomCollection";
import { useStockDetails } from "../hooks/useStockDetails";
import { useCollectionActions } from "../hooks/useCollectionActions";
import { fetchWrapper } from "../Context/FetchingHelper";

interface StockItem {
  symbol: string;
  name?: string;
  exchange?: string;
  [key: string]: unknown;
}

const IndividualCustomCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiKey } = useAuth();
  
  const [editNameMode, setEditNameMode] = useState(false);
  const [pendingName, setPendingName] = useState("");
  const [pendingDescription, setPendingDescription] = useState("");
  const [newToken, setNewToken] = useState("");
  const [searchResults, setSearchResults] = useState<StockItem[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { tokens, setTokens, collectionName, collectionDesc, updateCollectionName, error, setError, refreshCollection } = 
    useCustomCollection({ id, apiKey });
  
  const { stocksData, loadingStocks } = useStockDetails(tokens);
  
  const searchStocks = async () => {
    if (!newToken) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetchWrapper(fetch(`http://localhost:8000/searchStocks/${encodeURIComponent(newToken)}/0/`));
      if (!res.ok) throw new Error("Failed to search stocks");
      const data = await res.json();
      setSearchResults((data.results || data || []) as StockItem[]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Search: " + err.message);
      } else {
        setError("Search: " + String(err));
      }
    } finally {
      setSearching(false);
    }
  };
  
  const clearSearch = () => {
    setNewToken("");
    setSearchResults([]);
  };
  
  const { addStock, removeStock, pendingSymbol } = useCollectionActions({
    collectionName,
    apiKey,
    onRefresh: refreshCollection,
    onError: setError,
    onClearSearch: clearSearch,
    id,
    setTokens
  });
  
  const handleSaveName = async (name?: string, desc?: string) => {
    await updateCollectionName(name ?? pendingName, desc ?? pendingDescription);
    setEditNameMode(false);
  };
  
  const handleCancelEdit = () => {
    setPendingName(collectionName);
    setEditNameMode(false);
    setError("");
  };
  
  const handleEditName = () => {
    setPendingName(collectionName);
    setPendingDescription(collectionDesc || '');
    setEditNameMode(true);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[hsl(40,13%,53%)] pb-8">
      <NavigationBar />
      {error && (
        <div className="w-full max-w-[1800px] mx-auto px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError("")}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-[1800px] mx-auto px-8 flex gap-6 pt-24" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="w-80 flex-shrink-0 flex flex-col gap-4" style={{ height: '100%' }}>
          <div className="bg-[hsl(40,63%,63%)] shadow-[5px_5px_5px_#3F3A30] p-6 flex-shrink-0" style={{ borderRadius: '2px' }}>
            <CollectionNameEditor
              collectionName={collectionName}
              description={collectionDesc}
              editMode={editNameMode}
              pendingName={pendingName}
              pendingDescription={pendingDescription}
              onPendingNameChange={setPendingName}
              onPendingDescChange={setPendingDescription}
              onSave={handleSaveName}
              onCancel={handleCancelEdit}
              onEdit={handleEditName}
            />
          </div>

          <div className="bg-[hsl(40,63%,63%)] shadow-[5px_5px_5px_#3F3A30] p-4 flex-1 overflow-hidden flex flex-col" style={{ borderRadius: '2px' }}>
            <StockSearchPanel
              searchQuery={newToken}
              onSearchQueryChange={setNewToken}
              onSearch={searchStocks}
              searching={searching}
              searchResults={searchResults}
              onAddStock={addStock}
            />
          </div>
        </div>

        <CollectionStockTable
          stocksData={stocksData as StockItem[]}
          loadingStocks={loadingStocks}
          tokens={tokens}
          onStockClick={(symbol) => navigate(`/stock/${symbol}`)}
          onRemoveStock={removeStock}
          pendingSymbol={pendingSymbol}
        />
      </div>
    </div>
  );
};

export default IndividualCustomCollectionPage;