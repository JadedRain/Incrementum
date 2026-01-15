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
import type { CustomScreener } from '../Types/ScreenerTypes';
import { FilterDataProvider, useFilterData } from '../Context/FilterDataContext';
import { getDefaultFilterDict } from './DefaultScreenerHelper';
import type {RangeFilter} from "./DefaultScreenerHelper"

function IndividualScreenPageContent() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const { addFilter, setSelectedSectors, setSortValue, setSortBool } = useFilterData();

  const {setInitDict, setIsInit, initDict} = useFilterData()

  const { id } = useParams<{ id: string }>();
  
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

  if (!id) {
    return <div>Loading screener...</div>;
  }

  return (
      <div className="min-h-screen bg-[hsl(40,13%,53%)]">
        <NavigationBar />
        <Toast message={toast} />
        <div className="main-content">
          <div className="pt-32 px-8 ScreenerPage-main-layout">
            {/* Sidebar appears first on smaller screens, will stack above table */}
            <Sidebar 
              screenerName={screenerData?.screener_name}
            />
            <div className="w-full flex">
              <StockTable
                onRowClick={(symbol: string) => navigate(`/stock/${symbol}`)}
              />
            </div>
          <Sidebar 
            screenerName={screenerData?.screener_name}
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