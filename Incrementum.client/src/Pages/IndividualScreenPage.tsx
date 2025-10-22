import '../styles/SideBar.css'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import Loading from '../Components/Loading';
import Sidebar from '../Components/Sidebar';
import NavigationBar from '../Components/NavigationBar';
import type { CustomScreener, CategoricalFilter, NumericFilter } from '../Types/ScreenerTypes';
import { fetchCustomScreener } from "../Query/apiScreener"
import { useQuery } from "@tanstack/react-query"
import { useParams } from 'react-router-dom';
interface StockInfo {
  displayName?: string;
  longName?: string;
  shortName?: string;
  symbol?: string;
  regularMarketChangePercent?: number;
  currentPrice?: number;
}

function IndividualScreenPage() {

  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Loading screener...</div>; // or redirect
}
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const { data, error, isLoading } = useQuery<CustomScreener>({
    queryKey: ["customScreener", id],
    queryFn: () => fetchCustomScreener(id!, apiKey),
  });
  useEffect(()=>{
    console.log(data)
  }, [data]);
  

  const [percentThreshold, setPercentThreshold] = useState('');
  const [changePeriod, setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [percentChangeFilter, setPercentChangeFilter] = useState<string>('gt');

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
        const params = new URLSearchParams();
        params.set('max', '10');
        params.set('offset', '0');

        const filters: any = {};
        if (selectedSectors && selectedSectors.length) filters.sectors = selectedSectors;
        if (selectedIndustries && selectedIndustries.length) filters.industries = selectedIndustries;
        // Send percent change filter and period in backend-compatible format
        if (percentThreshold) {
          filters.percent_change_filter = percentChangeFilter;
          filters.percent_change_value = percentThreshold;
          filters.percent_change_period = changePeriod;
        }
        if (Object.keys(filters).length) params.set('filters', JSON.stringify(filters));

        const response = await fetch(`/getStockInfo/?${params.toString()}`);
        const data = await response.json();

        const newStocks = (data.stocks || []).slice(0, 4);

        // Logging: the stocks that will be set into state
        console.log('[IndividualScreenPage] setting stocks (after slice):', newStocks);

        setStocks(newStocks);
        setLoading(false);
    };

    fetchStocks();

  }, [selectedSectors, selectedIndustries, percentThreshold, percentChangeFilter, changePeriod]);
  // useEffect(()=>{
  //   const fetchparams = async () => {
      
  //   }
  //   fetchparams()
  // }, [])

  useEffect(() => {
    if (data) {
      const filterMap: Record<string, string[]> = {};

      data.categorical_filters.forEach(f => {
        const key = f.filter_name.toLowerCase();
        const values = Array.isArray(f.value) ? f.value : f.value ? [f.value] : [];

        if (!filterMap[key]) {
          filterMap[key] = [];
        }
        filterMap[key].push(...values); // append instead of overwrite
      });

      console.log(filterMap["sector"]);
      setSelectedSectors(filterMap["sector"] ?? []);
      setSelectedIndustries(filterMap["industry"] ?? []);
    }
  }, [data]);


useEffect(()=> {
  console.log(error?.message)
}, [error])
  return (
    <div className="min-h-screen bg-[hsl(40,13%,53%)]">
      <NavigationBar />
      <div className="main-content">
        <div className="pt-32 px-8 ScreenerPage-main-layout">
          <div className="w-full flex">
          <div className="StockTable-container">
            <div className="StockTable-header-row">
              <div className="StockTable-header">Company</div>
              <div className="StockTable-header">Symbol</div>
              <div className="StockTable-header">Chart</div>
              <div className="StockTable-header">Change</div>
            </div>
            <Loading loading={loading} />
            {!loading &&
              stocks.map((item, idx) => {
                const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
                const symbol = item.symbol || 'N/A';
                const percent = item.regularMarketChangePercent;
                return (
                  <div className="StockTable-row cursor-pointer" key={idx} onClick={() => navigate(`/stock/${symbol}`)}>
                    <div className="StockTable-cell font-medium">{name}</div>
                    <div className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>
                    <div className="StockTable-cell">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {symbol[0] || '?'}
                      </div>
                    </div>
                    <div className={`StockTable-cell ${percent != null && percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percent != null
                        ? (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`)
                        : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Sidebar
            selectedSectors={selectedSectors}
            onSelectedSectorsChange={setSelectedSectors}
            selectedIndustries={selectedIndustries}
            onSelectedIndustriesChange={setSelectedIndustries}
            percentThreshold={percentThreshold}
            onPercentThresholdChange={setPercentThreshold}
            changePeriod={changePeriod}
            onChangePeriod={setChangePeriod}
            percentChangeFilter={percentChangeFilter}
            onPercentChangeFilter={setPercentChangeFilter}
            showCustomScreenerSection={true}
            apiKey={apiKey || undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default IndividualScreenPage;