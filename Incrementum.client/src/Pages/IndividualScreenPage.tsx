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
  const { id: paramId } = useParams<{ id: string }>();
  // Default to 'custom_temp' (blank screener) if no id is provided
  const id = paramId || 'custom_temp';
  const { collections, loading: collectionsLoading } = useCustomCollections();
  const initialCollectionId = id && !isNaN(Number(id)) ? Number(id) : null;
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(initialCollectionId);
  const { data: bulkStockData } = useBulkStockDataForCollection(selectedCollectionId);
  const { stocks, addFilter, batchUpdateFilters, clearFilters } = useDatabaseScreenerContext();
  const { saveCollection } = useSaveCollection({ apiKey, setTokens: () => { }, resetForm: () => { }, onError: setSaveError });

  const handleSelectCollection = (collectionId: number | null) => {
    setSelectedCollectionId(collectionId);
  };

  const handleScreenerSelect = (screenerId: string) => {
    navigate(`/screener/${screenerId}`);
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

  // Apply default filters for predefined screeners
  useEffect(() => {
    // Clear existing filters first for predefined screeners
    const isPredefinedScreener = ['day_gainers', 'day_losers', 'most_actives', 'undervalued_growth_stocks', 'custom_temp'].includes(id || '');
    
    if (isPredefinedScreener) {
      clearFilters();
      
      // Apply filters based on screener type
      if (id === 'day_gainers') {
        // Day Gainers: Min price $0.50, Min volume 100 shares, Min percent change 2.5%
        batchUpdateFilters(
          [
            {
              operand: 'pps',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 0.5,
            },
            {
              operand: 'volume',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 100,
            },
            {
              operand: 'percent_change',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 2.5,
            },
          ],
          {
            sortBy: 'percent_change',
            sortAsc: false,
          }
        );
      } else if (id === 'day_losers') {
        // Day Losers: Min price $0.50, Min volume 100 shares, Max percent change -2.5%
        batchUpdateFilters(
          [
            {
              operand: 'pps',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 0.5,
            },
            {
              operand: 'volume',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 100,
            },
            {
              operand: 'percent_change',
              operator: 'less_than_or_equal',
              filter_type: 'numeric',
              value: -2.5,
            },
          ],
          {
            sortBy: 'percent_change',
            sortAsc: true,
          }
        );
      } else if (id === 'most_actives') {
        // Most Actives: Min price $0.50, Sort by volume
        batchUpdateFilters(
          [
            {
              operand: 'pps',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 0.5,
            },
            {
              operand: 'volume',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 1000,
            },
          ],
          {
            sortBy: 'volume',
            sortAsc: false,
          }
        );
      } else if (id === 'undervalued_growth_stocks') {
        // Undervalued Growth Stocks: P/E < 20, positive earnings growth
        batchUpdateFilters(
          [
            {
              operand: 'pps',
              operator: 'greater_than_or_equal',
              filter_type: 'numeric',
              value: 1.0,
            },
            {
              operand: 'pe_ratio',
              operator: 'less_than_or_equal',
              filter_type: 'numeric',
              value: 20,
            },
          ],
          {
            sortBy: 'pe_ratio',
            sortAsc: true,
          }
        );
      }
      // For 'custom_temp' (blank screener), no filters are applied after clearing
    }
  }, [id, batchUpdateFilters, clearFilters]);

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

      <SaveCollectionPopup
        isOpen={showSavePopup}
        onClose={() => { setShowSavePopup(false); setSaveError(null); }}
        onSave={handleSaveCollection}
      />
      {saveError && showSavePopup && (
        <div className="error-banner">{saveError}</div>
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
              onScreenerSelect={handleScreenerSelect}
              currentScreenerId={id}
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