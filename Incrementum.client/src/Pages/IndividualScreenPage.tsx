import '../styles/SideBar.css'
import '../styles/IndividualScreenerPage.css'
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Sidebar from '../Components/Sidebar'
import SaveScreenerPopup from '../Components/SaveScreenerPopup';
import { usePredefinedScreenerFilters } from '../hooks/usePredefinedScreenerFilters';
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import Toast from '../Components/Toast'
import { fetchCustomScreener, createCustomScreener, updateCustomScreener, fetchCustomScreeners } from "../Query/apiScreener"
import type { CustomScreener, NumericFilter, CategoricalFilter } from '../Types/ScreenerTypes';
import { DatabaseScreenerProvider, useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';
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
  const { id: paramId } = useParams<{ id: string }>();
  // Default to 'custom_temp' (blank screener) if no id is provided
  const id = paramId || 'custom_temp';
  const selectedCollectionId = id && !isNaN(Number(id)) ? Number(id) : null;
  const { data: bulkStockData } = useBulkStockDataForCollection(selectedCollectionId);
  const { stocks, filterList, addFilter, batchUpdateFilters, clearFilters } = useDatabaseScreenerContext();

  const handleScreenerSelect = (screenerId: string) => {
    navigate(`/screener/${screenerId}`);
  };

  const handleSave = async () => {
    setSaveError(null);
    
    // Check if filters are applied
    if (!filterList || filterList.length === 0) {
      setSaveError('No filters to save. Add at least one filter first.');
      setToast('No filters to save');
      return;
    }

    // Check if at least one categorical filter is present
    const hasCategoricalFilter = filterList.some(f => 
      f.filter_type === 'categoric' || f.filter_type === 'categorical'
    );
    if (!hasCategoricalFilter) {
      setSaveError('You need at least one categorical filter (e.g., Industry, Sector, Exchange).');
      setToast('Add a categorical filter');
      return;
    }

    // If we have a numeric id, update existing screener
    if (id && !isNaN(Number(id))) {
      const res = await updateCustomScreener(
        Number(id),
        screenerData?.screener_name || 'Untitled Screener',
        filterList,
        apiKey
      );
      if (res.ok) {
        setToast('Screener updated!');
      } else {
        setSaveError(res.error || 'Failed to update screener');
        setToast('Failed to update screener');
      }
    } else {
      // Otherwise, show popup to create new screener
      setShowSavePopup(true);
    }
  };

  const handleSaveScreener = async (name: string) => {
    setSaveError(null);
    
    if (!filterList || filterList.length === 0) {
      setSaveError('No filters to save. Add at least one filter first.');
      return;
    }

    // Check if at least one categorical filter is present
    const hasCategoricalFilter = filterList.some(f => 
      f.filter_type === 'categoric' || f.filter_type === 'categorical'
    );
    if (!hasCategoricalFilter) {
      setSaveError('You need at least one categorical filter (e.g., Industry, Sector, Exchange).');
      return;
    }

    const res = await createCustomScreener(name, filterList, apiKey);
    if (res.ok) {
      setShowSavePopup(false);
      setToast('Screener saved!');
      // Navigate to the new screener
      if (res.data?.id) {
        navigate(`/screener/${res.data.id}`);
      }
    } else {
      setSaveError(res.error || 'Failed to save screener');
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

  const { data: customScreenersData } = useQuery<{ screeners: Array<{ id: number; screener_name: string; created_at: string; filter_count: number }> }>({
    queryKey: ["customScreeners", apiKey],
    queryFn: () => fetchCustomScreeners(apiKey),
    enabled: !!apiKey,
  });

  // Apply default filters for predefined screeners
  usePredefinedScreenerFilters({
    screenerId: id,
    batchUpdateFilters,
    clearFilters,
  });

  useEffect(() => {
    // Only load custom screener data if id is numeric (custom screener)
    if (screenerData && id && !isNaN(Number(id))) {
      // Clear filters before loading custom screener filters
      clearFilters();

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
  }, [screenerData, addFilter, clearFilters, id]);

  const [displayStocks, setDisplayStocks] = useState<StockItem[]>(Array.isArray(stocks) ? (stocks as StockItem[]) : []);
  useEffect(() => {
    if (selectedCollectionId && Array.isArray(bulkStockData) && bulkStockData.length > 0) {
      setDisplayStocks(bulkStockData as StockItem[]);
    } else {
      setDisplayStocks(Array.isArray(stocks) ? (stocks as StockItem[]) : []);
    }
  }, [selectedCollectionId, bulkStockData, stocks]);

  const isCollectionView = !!selectedCollectionId && Array.isArray(bulkStockData);

  return (
    <div className="screener-page">
      <NavigationBar />
      <Toast message={toast} />

      <SaveScreenerPopup
        isOpen={showSavePopup}
        onClose={() => { setShowSavePopup(false); setSaveError(null); }}
        onSave={handleSaveScreener}
        defaultName={screenerData?.screener_name}
      />
      {saveError && (
        <div className="error-banner" style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1001, backgroundColor: '#fee', padding: '10px 20px', borderRadius: '8px', border: '1px solid #fcc' }}>
          {saveError}
        </div>
      )}

      <div className="screener-container">
        <div className="screener-grid">
          <div className="screener-topbar">
            <TopBar
              potentialGainsToggled={potentialGainsToggled}
              togglePotentialGains={togglePotentialGains}
              onSave={handleSave}
              onScreenerSelect={handleScreenerSelect}
              currentScreenerId={id}
              customScreeners={customScreenersData?.screeners || []}
            />
          </div>

          <div className="screener-table">
            {!potentialGainsToggled &&
            <>
              {isCollectionView ? (
                <StockTable
                  stocks={displayStocks}
                  onRowClick={(symbol: string) =>
                    navigate(`/stock/${symbol}`)
                  }
                />
              ) : (
                <StockTable
                  onRowClick={(symbol: string) =>
                    navigate(`/stock/${symbol}`)
                  }
                />
              )}
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