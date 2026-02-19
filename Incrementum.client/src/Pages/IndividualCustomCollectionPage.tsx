import '../styles/Collections/IndividualCustomCollectionPage.css'
import '../styles/SearchBar.css'
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CollectionNameEditor from "../Components/CollectionNameEditor";
import StockSearchPanel from "../Components/StockSearchPanel";
import CollectionStockTableImport from "../Components/CollectionStockTable";

type CollectionStockTableProps = {
  stocksData: StockItem[];
  loadingStocks: boolean;
  tokens: string[];
  onStockClick: (symbol: string) => void;
  collectionId?: string | undefined;
  collectionName?: string | undefined;
};

const CollectionStockTable = CollectionStockTableImport as unknown as React.ComponentType<CollectionStockTableProps>;

import { useAuth } from "../Context/AuthContext";
import NavigationBar from "../Components/NavigationBar";
import { useCustomCollection } from "../hooks/useCustomCollection";
import { useStockDetails } from "../hooks/useStockDetails";
import { useCollectionActions } from "../hooks/useCollectionActions";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

interface StockItem {
  symbol: string;
  name?: string;
  exchange?: string;
  [key: string]: unknown;
}

const IndividualCustomCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: idParam } = useParams();
  const { apiKey } = useAuth();
  
  const collectionId = idParam ? parseInt(idParam, 10) : null;
  
  const [editNameMode, setEditNameMode] = useState(false);
  const [pendingName, setPendingName] = useState("");
  const [pendingDescription, setPendingDescription] = useState("");
  const [newToken, setNewToken] = useState("");
  const [searchResults, setSearchResults] = useState<StockItem[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { tokens, setTokens, collectionName, collectionDesc, updateCollectionName, error, setError, refreshCollection } = 
    useCustomCollection({ id: collectionId, apiKey });
  
  const { stocksData, loadingStocks } = useStockDetails(tokens);
  
  const searchStocks = async () => {
    if (!newToken) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetchWrapper(()=>fetch(apiString(`/stocks/search/${encodeURIComponent(newToken)}/0/`)));
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
  
  const { addStock } = useCollectionActions({
    collectionName,
    apiKey,
    onRefresh: refreshCollection,
    onError: setError,
    onClearSearch: clearSearch,
    id: idParam,
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
    <div className="page-shell">
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
      <div className="collection-page-layout">
        <div className="panel-left">
          <div className="panel">
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

          <div className="panel-search">
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
          collectionId={idParam}
          collectionName={collectionName}
        />
      </div>
    </div>
  );
};

export default IndividualCustomCollectionPage;