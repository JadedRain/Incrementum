import '../styles/SideBar.css'
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Sidebar from '../Components/Sidebar'
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import Toast from '../Components/Toast'
import { fetchCustomScreener } from "../Query/apiScreener"
import { useFetchWatchlist } from '../useFetchWatchlist';
import { useWatchlistScreeners } from '../hooks/useWatchlistScreeners';
import { addToWatchlist, removeFromWatchlist } from '../utils/watchlistActions';
import type { CustomScreener } from '../Types/ScreenerTypes';
import { FilterDataProvider, useFilterData } from '../Context/FilterDataContext';
import { getDefaultFilterDict } from './DefaultScreenerHelper';
import type {RangeFilter} from "./DefaultScreenerHelper"
import { fetchWrapper } from "../Context/FetchingHelper";

function IndividualScreenPageContent() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [pendingScreener, setPendingScreener] = useState<boolean>(false);
  const { addFilter, setSelectedSectors, setSortValue, setSortBool } = useFilterData();

  const { watchlistSymbols, setWatchlistSymbols } = useFetchWatchlist(apiKey);
  const {setInitDict, setIsInit, initDict} = useFilterData()
  const { watchlistScreenerIds, setWatchlistScreenerIds } = useWatchlistScreeners(apiKey);

  const { id } = useParams<{ id: string }>();
  
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: screenerData } = useQuery<CustomScreener>({
    queryKey: ["customScreener", id],
    queryFn: () => fetchCustomScreener(id!, apiKey),
    enabled: !!id && !isNaN(Number(id)),
  });


  useEffect(() => {
    const numid = Number(id);
    if (isNaN(numid)) {
      const base = getDefaultFilterDict(id!) as (Record<string, unknown> & { notimplemented?: string[]; sortValue?: unknown; sortBool?: unknown }) | null;
      setIsInit(true);
      console.log(base)
      if(base != null && Object.hasOwn(base, "sortValue"))
      {
        const val = base["sortValue"]?.toString() ?? null
        const bol = base["sortBool"]?.toString() ?? null
        setSortValue(val)
        setSortBool(bol)
      }
      if (base != null && Array.isArray(base.notimplemented)) {
        const list = base.notimplemented;

        if (Array.isArray(list)) {
          for (const item of list) {
            const minmaxData = base[item as string] as RangeFilter
            if(minmaxData.high != null)
            {
              addFilter(item + "high", { operand: item, operator: "lt", filter_type: "numeric", value_high: null, value_low: null, value: minmaxData.high,})
            }
            if(minmaxData.low != null)
            {
              addFilter(item + "high", { operand: item, operator: "gt", filter_type: "numeric", value_high: null, value_low: null, value: minmaxData.low,})
            }
          }
        }
  }
      setInitDict(()=>{
        console.log(base);
        return base!});
      console.log(initDict)
    }
  }, [addFilter, id, initDict, setInitDict, setIsInit, setSortBool, setSortValue]);
  // Load filters when screener data is fetched
  useEffect(() => {
    if (screenerData) {
      console.log('Loading screener data:', screenerData);
      
      const sectorsToLoad: string[] = [];
      
      type NumericFilter = {
        operand?: string;
        filter_name?: string;
        operator?: string;
        value_high?: number | null;
        value_low?: number | null;
        value?: number | null;
      };

      type CategoricalFilter = {
        operand?: string;
        filter_name?: string;
        operator?: string;
        value?: string | number | null;
      };

      // Load numeric filters
      if (screenerData.numeric_filters) {
        (screenerData.numeric_filters as NumericFilter[]).forEach((filter: NumericFilter, index: number) => {
          const key = `numeric_${filter.operand || filter.filter_name}_${index}`;
          const filterData = {
            operand: filter.operand || filter.filter_name || '',
            operator: filter.operator || 'between',
            filter_type: 'numeric' as const,
            value_high: filter.value_high ?? null,
            value_low: filter.value_low ?? null,
            value: filter.value ?? null,
          };
          console.log('Adding numeric filter:', key, filterData);
          addFilter(key, filterData);
        });
      }

      // Load categorical filters
      if (screenerData.categorical_filters) {
        (screenerData.categorical_filters as CategoricalFilter[]).forEach((filter: CategoricalFilter, index: number) => {
          // Use sector-specific key format for sector filters to match Sectors.tsx
          const isSectorFilter = filter.operand === 'sector' || filter.filter_name === 'sector';
          const key = isSectorFilter 
            ? `sector.${filter.value}` 
            : `categorical_${filter.operand || filter.filter_name}_${index}`;
          
          const filterData = {
            operand: filter.operand || filter.filter_name || '',
            operator: filter.operator || 'eq',
            filter_type: 'categoric' as const,
            value: filter.value ?? null,
            value_high: null,
            value_low: null,
          };
          console.log('Adding categorical filter:', key, filterData);
          addFilter(key, filterData);
          
          if (isSectorFilter && filter.value != null) {
            sectorsToLoad.push(String(filter.value));
          }
        });
      }
      
      if (sectorsToLoad.length > 0) {
        console.log('Setting selected sectors:', sectorsToLoad);
        setSelectedSectors(sectorsToLoad);
      }
    }
  }, [screenerData, addFilter, setSelectedSectors]);

  const handleToggleWatchlist = async (symbol: string, inWatchlist: boolean) => {
    if (!apiKey || !symbol) return;

    if (inWatchlist) {
      await removeFromWatchlist(symbol, apiKey, setPending, setToast, undefined, setWatchlistSymbols);
    } else {
      await addToWatchlist(symbol, apiKey, setPending, setToast, undefined, setWatchlistSymbols);
    }
  };

  const handleToggleScreenerWatchlist = async () => {
    if (!apiKey || !id) return;

    const screenerId = Number(id);
    if (isNaN(screenerId)) return;

    const inWatchlist = watchlistScreenerIds.has(screenerId);
    console.log('Toggle watchlist clicked:', { screenerId, inWatchlist, apiKey });
    setPendingScreener(true);

    try {
      const endpoint = inWatchlist 
        ? '/watchlist/custom-screeners/remove/' 
        : '/watchlist/custom-screeners/add/';
      const method = inWatchlist ? 'DELETE' : 'POST';

      console.log('Making request:', { endpoint, method, screenerId });

      const res = await fetchWrapper(fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': apiKey 
        },
        body: JSON.stringify({ custom_screener_id: screenerId }),
      }));

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Failed to ${inWatchlist ? 'remove' : 'add'} screener`);
      }

      const responseData = await res.json();
      console.log('Success response:', responseData);

      // Update the watchlist state
      if (inWatchlist) {
        setWatchlistScreenerIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(screenerId);
          console.log('Updated watchlist (removed):', Array.from(newSet));
          return newSet;
        });
        setToast('Screener removed from watchlist');
      } else {
        setWatchlistScreenerIds(prev => {
          const newSet = new Set(prev).add(screenerId);
          console.log('Updated watchlist (added):', Array.from(newSet));
          return newSet;
        });
        setToast('Screener added to watchlist');
      }

      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Error toggling screener watchlist:', error);
      setToast(error instanceof Error ? error.message : 'Failed to update watchlist');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setPendingScreener(false);
    }
  };

  if (!id) {
    return <div>Loading screener...</div>;
  }

  const screenerId = Number(id);
  const screenerInWatchlist = !isNaN(screenerId) && watchlistScreenerIds.has(screenerId);

  return (
      <div className="min-h-screen bg-[hsl(40,13%,53%)]">
        <NavigationBar />
        <Toast message={toast} />
        <div className="main-content">
          <div className="pt-32 px-8 ScreenerPage-main-layout">
            {/* Sidebar appears first on smaller screens, will stack above table */}
            <Sidebar 
              screenerName={screenerData?.screener_name}
              screenerInWatchlist={screenerInWatchlist}
              pendingScreener={pendingScreener}
              onToggleScreenerWatchlist={apiKey ? handleToggleScreenerWatchlist : undefined}
            />
            <div className="w-full flex">
              <StockTable
                onRowClick={(symbol: string) => navigate(`/stock/${symbol}`)}
                watchlistSymbols={watchlistSymbols}
                onToggleWatchlist={handleToggleWatchlist}
                pendingSymbol={pending}
              />
            </div>
          <Sidebar 
            screenerName={screenerData?.screener_name}
            screenerInWatchlist={screenerInWatchlist}
            pendingScreener={pendingScreener}
            onToggleScreenerWatchlist={apiKey ? handleToggleScreenerWatchlist : undefined}
            onShowToast={showToast}
          />
        </div>
      </div>
    </div>
  );
}

function IndividualScreenPage() {
  return (
    <FilterDataProvider>
      <IndividualScreenPageContent />
    </FilterDataProvider>
  );
}

export default IndividualScreenPage;