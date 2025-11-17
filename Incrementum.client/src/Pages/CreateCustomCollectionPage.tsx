import '../styles/SearchBar.css'
import '../styles/Collections/CreateCustomCollectionsPage.css'
import { useState, useEffect } from 'react';
import useCreateCollectionForm from '../hooks/useCreateCollectionForm';
import useSaveCollection from '../hooks/useSaveCollection';
import { useAuth } from '../Context/AuthContext';
import NavigationBar from '../Components/NavigationBar';
import CreateCollectionLeftPanel from '../Components/CreateCollectionLeftPanel';
import { useCollectionActions } from '../hooks/useCollectionActions';
import { useStockDetails } from '../hooks/useStockDetails';
import { useCustomCollection } from '../hooks/useCustomCollection';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CreateCustomCollectionStockTable from '../Components/CreateCustomCollectionStockTable';

const CreateCustomCollectionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiKey } = useAuth();
  const location = useLocation();

  const [editNameMode, setEditNameMode] = useState(false);
  const { tokens, setTokens, collectionName, collectionDesc, updateCollectionName, error, setError, refreshCollection } =
    useCustomCollection({ id, apiKey });

  const {
    pendingName,
    setPendingName,
    pendingDescription,
    setPendingDescription,
    newToken,
    setNewToken,
    searchResults,
    searching,
    searchStocks,
    resetForm,
  } = useCreateCollectionForm({ onError: setError });

  const { saveCollection, saving } = useSaveCollection({ apiKey, setTokens, resetForm, onError: setError });

  const handleSaveCollection = async () => {
    const nameToUse = (collectionName && collectionName.trim()) || (pendingName && pendingName.trim());
    const descToUse = pendingDescription || '';

    const res = await saveCollection({ name: nameToUse, desc: descToUse, symbols: tokens });
    if (!res.ok) return;

    setEditNameMode(false);
    navigate('/custom-collections');
  };

  const { stocksData, loadingStocks } = useStockDetails(tokens);

  useEffect(() => {
    if (id) return;
    const navState = (location?.state as { ticker?: string; selectedStocks?: string[] } | undefined) || {};
    const selectedFromNav: string[] | undefined = navState.selectedStocks;
    if (selectedFromNav && selectedFromNav.length > 0 && (tokens || []).length === 0) {
      setTokens(selectedFromNav);
    }
  }, [id, location, setTokens, tokens, tokens.length]);

  const { addStock, removeStock, pendingSymbol } = useCollectionActions({
    collectionName,
    apiKey,
    onRefresh: refreshCollection,
    onError: setError,
    id,
    setTokens
  });

  const handleSaveName = async (name?: string, desc?: string) => {
    const ok = await updateCollectionName(name ?? pendingName, desc ?? pendingDescription);
    if (ok) setEditNameMode(false);
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
        <CreateCollectionLeftPanel
          collectionName={collectionName}
          collectionDesc={collectionDesc}
          editMode={editNameMode}
          pendingName={pendingName}
          pendingDescription={pendingDescription}
          onPendingNameChange={setPendingName}
          onPendingDescChange={setPendingDescription}
          onSaveName={handleSaveName}
          onCancelEdit={handleCancelEdit}
          onEditName={handleEditName}
          newToken={newToken}
          setNewToken={setNewToken}
          searchStocks={searchStocks}
          searching={searching}
          searchResults={searchResults}
          onAddStock={addStock}
          onSaveCollection={handleSaveCollection}
          onCancel={() => {
            setError('');
            navigate('/custom-collections');
          }}
          saving={saving}
        />

        <CreateCustomCollectionStockTable
          stocksData={stocksData}
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

export default CreateCustomCollectionPage;