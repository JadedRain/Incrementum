import '../styles/SideBar.css'
import '../styles/IndividualScreenerPage.css'
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Sidebar from '../Components/Sidebar'
import SaveCollectionPopup from '../Components/SaveCollectionPopup';
import useSaveCollection from '../hooks/useSaveCollection';
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import Toast from '../Components/Toast'
import Loading from '../Components/Loading';
import { fetchCustomScreener } from "../Query/apiScreener"
import type { CustomScreener, NumericFilter, CategoricalFilter } from '../Types/ScreenerTypes';
import { DatabaseScreenerProvider, useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';
import { useCustomCollections } from '../hooks/useCustomCollections';
import { useBulkStockDataForCollection } from '../hooks/useBulkStockData';
import TopBar from '../Components/IndividualScreenerPage/ScreenerTopBar';
import PotentialGainsTable from '../Components/IndividualScreenerPage/PotentialGainsTable';

interface StockItem { symbol?: string;[key: string]: unknown }

function IndividualScreenPageContent() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { collections, loading: collectionsLoading } = useCustomCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(id ? Number(id) : null);
  const { data: bulkStockData } = useBulkStockDataForCollection(selectedCollectionId);
  const { stocks, addFilter} = useDatabaseScreenerContext();
  const { saveCollection } = useSaveCollection({ apiKey, setTokens: () => { }, resetForm: () => { }, onError: setSaveError });

  const handleSelectCollection = (collectionId: number | null) => {
    setSelectedCollectionId(collectionId);
  };

  const handleSave = async () => {
    setSaveError(null);
    const symbols = (Array.isArray(stocks) ? (stocks as StockItem[]) : []).map((s) => s?.symbol).filter((sym): sym is string => typeof sym === 'string' && sym.length > 0);
    if (!symbols.length) {
      setSaveError('No stocks to save. Run the screener to get results first.');
      setShowSavePopup(false);
      return;
    }

    if (id && !isNaN(Number(id))) {
      const res = await saveCollection({ name: screenerData?.screener_name || '', symbols });
      if (res.ok) {
        setToast('Collection updated!');
      } else {
        setSaveError(res.error || 'Failed to update collection');
      }
    } else {
      setShowSavePopup(true);
    }
  };

  const handleSaveCollection = async (name: string, desc?: string) => {
    setSaveError(null);
    const symbols = (Array.isArray(stocks) ? (stocks as StockItem[]) : []).map((s) => s?.symbol).filter((sym): sym is string => typeof sym === 'string' && sym.length > 0);
    if (!symbols.length) {
      setSaveError('No stocks to save. Run the screener to get results first.');
      return;
    }
    const res = await saveCollection({ name, desc, symbols });
    if (res.ok) {
      setShowSavePopup(false);
      setToast('Collection saved!');
    } else {
      setSaveError(res.error || 'Failed to save collection');
    }
  };

  const [potentialGainsToggled, setPotentialGainsToggled] = useState<boolean>(false);
  const togglePotentialGains = () => {
    setPotentialGainsToggled(!potentialGainsToggled);
  }

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: screenerData } = useQuery<CustomScreener>({
    queryKey: ["customScreener", id],
    queryFn: () => fetchCustomScreener(id!, apiKey),
    enabled: !!id && !isNaN(Number(id)) && !!apiKey,
  });


  useEffect(() => {
    if (screenerData) {

      if (Array.isArray(screenerData.numeric_filters)) {
        screenerData.numeric_filters.forEach((filter: NumericFilter) => {
          addFilter({
            operand: filter.operand || filter.filter_name || '',
            operator: filter.operator || 'between',
            filter_type: 'numeric',
            value: filter.value ?? null,
          });
        });
      }

      if (Array.isArray(screenerData.categorical_filters)) {
        screenerData.categorical_filters.forEach((filter: CategoricalFilter) => {
          addFilter({
            operand: filter.operand || filter.filter_name || '',
            operator: filter.operator || 'eq',
            filter_type: 'categoric',
            value: filter.value ?? null,
          });
        });
      }
    }
  }, [screenerData, addFilter]);

  const [displayStocks, setDisplayStocks] = useState<StockItem[]>(Array.isArray(stocks) ? (stocks as StockItem[]) : []);
  useEffect(() => {
    if (selectedCollectionId && Array.isArray(bulkStockData) && bulkStockData.length > 0) {
      setDisplayStocks(bulkStockData as StockItem[]);
    } else {
      setDisplayStocks(Array.isArray(stocks) ? (stocks as StockItem[]) : []);
    }
  }, [selectedCollectionId, bulkStockData, stocks]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.ceil(displayStocks.length / pageSize);
  const paginatedStocks = displayStocks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!id) {
    return <Loading loading={true} />;
  }

  return (
    <div className="screener-page">
      <NavigationBar />
      <Toast message={toast} />

      <SaveCollectionPopup
        isOpen={showSavePopup}
        onClose={() => { setShowSavePopup(false); setSaveError(null); }}
        onSave={handleSaveCollection}
      />
      {saveError && showSavePopup && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{saveError}</div>
      )}

      <div className="screener-container">
        <div className="screener-grid">
          <div className="screener-topbar">
            <TopBar
              potentialGainsToggled={potentialGainsToggled}
              togglePotentialGains={togglePotentialGains}
              onSave={handleSave}
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={handleSelectCollection}
              collectionsLoading={collectionsLoading}
            />
          </div>

          <div className="screener-table">
            {!potentialGainsToggled &&
            <>
                <StockTable
                  stocks={paginatedStocks}
                  onRowClick={(symbol: string) =>
                    navigate(`/stock/${symbol}`)
                  }
                />
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt; Prev</button>
                  <span style={{ margin: '0 12px' }}>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt; Next</button>
                </div>
              </>
            }
            {potentialGainsToggled && (
              <PotentialGainsTable
                filteredSymbols={
                  Array.isArray(stocks)
                    ? stocks
                        .filter((s: unknown): s is { symbol: string } =>
                          typeof s === 'object' &&
                          s !== null &&
                          'symbol' in s &&
                          typeof (s as { symbol?: unknown }).symbol === 'string'
                        )
                        .map((s) => s.symbol)
                    : []
                }
              />
            )}
          </div>

          <aside className="screener-sidebar">
            <Sidebar
              screenerName={screenerData?.screener_name}
              onShowToast={showToast}
            />
          </aside>
        </div>

      </div>
    </div>

  );
}

function IndividualScreenPage() {
  return (
    <DatabaseScreenerProvider>
      <IndividualScreenPageContent />
    </DatabaseScreenerProvider>
  );
}

export default IndividualScreenPage;