import '../styles/SideBar.css'
import '../styles/IndividualScreenerPage.css'
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { usePreferences } from '../Context/usePreferences';
import Sidebar from '../Components/Sidebar'
import SaveScreenerPopup from '../Components/SaveScreenerPopup';
import { usePredefinedScreenerFilters } from '../hooks/usePredefinedScreenerFilters';
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import Toast from '../Components/Toast'
import { fetchCustomScreener, fetchCustomScreenerShareToken, fetchSharedCustomScreener, createCustomScreener, updateCustomScreener, fetchCustomScreeners, updateScreenerPrivacy, ScreenerFetchError } from "../Query/apiScreener"
import type { CustomScreener, NumericFilter, CategoricalFilter } from '../Types/ScreenerTypes';
import { DatabaseScreenerProvider, useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';
import TopBar from '../Components/IndividualScreenerPage/ScreenerTopBar';
import PotentialGainsTable from '../Components/IndividualScreenerPage/PotentialGainsTable';
import { buildShareableUrl, parseSharedScreenerParams } from '../utils/screenerShareUtils';

function IndividualScreenPageContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { apiKey } = useAuth();
  const { defaultPrivate } = usePreferences();
  const [toast, setToast] = useState<string | null>(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to 'custom_temp' (blank screener) if no id is provided
  const id = paramId || 'custom_temp';
  const { stocks, filterList, sortBy, sortAsc, addFilter, batchUpdateFilters, clearFilters, undoFilters, redoFilters } = useDatabaseScreenerContext();
  // Track whether the page was opened via a share link (computed once on mount)
  const [isSharedLoad] = useState(() => searchParams.has('shared'));

  const handleScreenerSelect = (screenerId: string) => {
    navigate(`/screener/${screenerId}`);
  };

  const handleShare = () => {
    // If this is a saved screener, share a generated token link.
    if (id && !isNaN(Number(id))) {
      if (!apiKey) {
        setToast('Login required to share saved screeners');
        return;
      }

      fetchCustomScreenerShareToken(Number(id), apiKey)
        .then((res) => {
          if (!res.ok || !res.data?.token) {
            setToast('Failed to generate share link');
            return;
          }

          const url = new URL(window.location.origin + '/screener/custom_temp');
          url.searchParams.set('shared', res.data.token);
          return navigator.clipboard.writeText(url.toString()).then(() => {
            setToast('Share link copied to clipboard!');
          });
        })
        .catch(() => {
          setToast('Failed to generate share link');
        });

      return;
    }

    // Otherwise, fall back to an encoded "temporary" share link.
    if (!filterList || filterList.length === 0) {
      setToast('No filters to share. Add at least one filter first.');
      return;
    }
    const url = buildShareableUrl(filterList, sortBy, sortAsc);
    navigator.clipboard.writeText(url).then(() => {
      setToast('Share link copied to clipboard!');
    }).catch(() => {
      setToast('Failed to copy link');
    });
  };

  // Apply shared filters from URL on initial load
  useEffect(() => {
    if (!isSharedLoad) return;
    const sharedData = parseSharedScreenerParams(searchParams);
    if (sharedData) {
      batchUpdateFilters(sharedData.filters, {
        sortBy: sharedData.sortBy,
        sortAsc: sharedData.sortAsc,
      });
      // Remove the shared param from URL to keep it clean
      setSearchParams({}, { replace: true });
      setToast('Shared screener filters applied!');
      return;
    }

    // If it isn't a base64-encoded filter payload, treat it as a share token.
    const token = searchParams.get('shared');
    if (!token) return;

    fetchSharedCustomScreener(token)
      .then((data) => {
        const numericFilters = Array.isArray(data?.numeric_filters)
          ? data.numeric_filters
              .filter((f: unknown): f is { operator?: string; operand?: string; value?: unknown } =>
                typeof f === 'object' && f !== null
              )
              .map((f: { operator?: string; operand?: string; value?: unknown }) => ({
                operator: f.operator || 'between',
                operand: f.operand || '',
                filter_type: 'numeric',
                value: (f.value as string | number | boolean | null | undefined) ?? null,
              }))
          : [];

        const categoricalFilters = Array.isArray(data?.categorical_filters)
          ? data.categorical_filters
              .filter((f: unknown): f is { operator?: string; operand?: string; value?: unknown } =>
                typeof f === 'object' && f !== null
              )
              .map((f: { operator?: string; operand?: string; value?: unknown }) => ({
                operator: f.operator || 'eq',
                operand: f.operand || '',
                filter_type: 'categoric',
                value: (f.value as string | number | boolean | null | undefined) ?? null,
              }))
          : [];

        batchUpdateFilters([...numericFilters, ...categoricalFilters]);
        setSearchParams({}, { replace: true });
        setToast('Shared screener loaded!');
      })
      .catch((e: unknown) => {
        if (e instanceof ScreenerFetchError && e.status === 403) {
          setToast('This screener is private');
          return;
        }
        setToast('Failed to load shared screener');
      });
  // Run only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss toast messages
  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handlePrivacyToggle = async () => {
    if (!apiKey) {
      setToast('Login required to change privacy');
      return;
    }
    if (!id || isNaN(Number(id))) {
      setToast('Save the screener first to change privacy settings');
      return;
    }

    const newPrivacyState = !isPrivate;
    const res = await updateScreenerPrivacy(
      Number(id),
      newPrivacyState,
      apiKey
    );

    if (res.ok) {
      setIsPrivate(newPrivacyState);
      setToast(newPrivacyState ? 'Screener is now private' : 'Screener is now public');
    } else {
      setToast('Failed to update privacy setting');
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
      setToast('Login required to save');
      return;
    }
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
        // Invalidate queries to refresh the screener data and list
        queryClient.invalidateQueries({ 
          queryKey: ["customScreener", id],
          refetchType: 'active'
        });
        queryClient.invalidateQueries({ 
          queryKey: ["customScreeners", apiKey],
          refetchType: 'active'
        });
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

    if (!apiKey) {
      setSaveError('Login required to save screener.');
      return;
    }
    
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

    const res = await createCustomScreener(name, filterList, apiKey, defaultPrivate);
    if (res.ok) {
      setShowSavePopup(false);
      setToast('Screener saved!');
      // Invalidate and refetch the custom screeners list to show the new screener immediately
      await queryClient.invalidateQueries({ 
        queryKey: ["customScreeners", apiKey],
        refetchType: 'active'
      });
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

  const { data: screenerData, error: screenerFetchError } = useQuery<CustomScreener>({
    queryKey: ["customScreener", id, apiKey ?? 'public'],
    queryFn: () => fetchCustomScreener(id!, apiKey),
    enabled: !!id && !isNaN(Number(id)),
    retry: (failureCount, error) => {
      if (error instanceof ScreenerFetchError && (error.status === 403 || error.status === 404)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const { data: customScreenersData } = useQuery<{ screeners: Array<{ id: number; screener_name: string; created_at: string; filter_count: number }> }>({
    queryKey: ["customScreeners", apiKey],
    queryFn: () => fetchCustomScreeners(apiKey),
    enabled: !!apiKey,
  });

  useEffect(() => {
    if (!screenerFetchError) {
      setLoadError(null);
      return;
    }

    if (screenerFetchError instanceof ScreenerFetchError) {
      if (screenerFetchError.status === 403) {
        setLoadError('This screener is private.');
        return;
      }
      if (screenerFetchError.status === 404) {
        setLoadError('Screener not found.');
        return;
      }
    }

    setLoadError('Failed to load screener.');
  }, [screenerFetchError]);

  // Apply default filters for predefined screeners (skip if applying shared filters)
  usePredefinedScreenerFilters({
    screenerId: id,
    batchUpdateFilters,
    clearFilters,
    skipPredefined: isSharedLoad,
  });

  // Global keyboard shortcuts for filter undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (target as HTMLElement).isContentEditable;
        if (isInput) {
          return; // Do not override native undo/redo in text inputs
        }
      }

      const key = event.key.toLowerCase();
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (isCtrlOrMeta && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoFilters();
      } else if (isCtrlOrMeta && key === 'y') {
        event.preventDefault();
        redoFilters();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoFilters, redoFilters]);

  useEffect(() => {
    // Only load custom screener data if id is numeric (custom screener)
    if (screenerData && id && !isNaN(Number(id))) {
      // Clear filters before loading custom screener filters
      clearFilters();

      // Set privacy state if available, otherwise default to true
      if ('is_private' in screenerData) {
        setIsPrivate(screenerData.is_private);
      }

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
      {(saveError || loadError) && (
        <div className="error-banner">
          {saveError || loadError}
        </div>
      )}

      <div className="screener-container">
        <div className="screener-grid">
          <div className="screener-topbar">
            <TopBar
              potentialGainsToggled={potentialGainsToggled}
              togglePotentialGains={togglePotentialGains}
              onSave={handleSave}
              onShare={handleShare}
              onScreenerSelect={handleScreenerSelect}
              currentScreenerId={id}
              customScreeners={customScreenersData?.screeners || []}
              isPrivate={isPrivate}
              onPrivacyToggle={handlePrivacyToggle}
              privacyDisabled={!apiKey || !id || isNaN(Number(id))}
            />
          </div>

          <div className="screener-table">
            {!potentialGainsToggled &&
              <StockTable
                onRowClick={(symbol: string) =>
                  navigate(`/stock/${symbol}`)
                }
              />
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