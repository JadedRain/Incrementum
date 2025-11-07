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
import { addToWatchlist, removeFromWatchlist } from '../utils/watchlistActions';
import type { CustomScreener } from '../Types/ScreenerTypes';
import { FilterDataProvider, useFilterData } from '../Context/FilterDataContext';

function IndividualScreenPageContent() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const { addFilter, setSelectedSectors } = useFilterData();

  const { watchlistSymbols, setWatchlistSymbols } = useFetchWatchlist(apiKey);

  const { id } = useParams<{ id: string }>();

  const { data: screenerData } = useQuery<CustomScreener>({
    queryKey: ["customScreener", id],
    queryFn: () => fetchCustomScreener(id!, apiKey),
    enabled: !!id && !isNaN(Number(id)),
  });

  // Load filters when screener data is fetched
  useEffect(() => {
    if (screenerData) {
      console.log('Loading screener data:', screenerData);
      
      const sectorsToLoad: string[] = [];
      
      // Load numeric filters
      if (screenerData.numeric_filters) {
        screenerData.numeric_filters.forEach((filter: any, index: number) => {
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
        screenerData.categorical_filters.forEach((filter: any, index: number) => {
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
          
          if (isSectorFilter && filter.value) {
            sectorsToLoad.push(filter.value);
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

  if (!id) {
    return <div>Loading screener...</div>;
  }

  return (
    <div className="min-h-screen bg-[hsl(40,13%,53%)]">
      <NavigationBar />
      <Toast message={toast} />
      <div className="main-content">
        <div className="pt-32 px-8 ScreenerPage-main-layout">
          <div className="w-full flex">
            <StockTable
              onRowClick={(symbol: string) => navigate(`/stock/${symbol}`)}
              watchlistSymbols={apiKey ? watchlistSymbols : undefined}
              onToggleWatchlist={apiKey ? handleToggleWatchlist : undefined}
              pendingSymbol={apiKey ? pending : undefined}
            />
          </div>
          <Sidebar />
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