import '../styles/SideBar.css'
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Sidebar from '../Components/Sidebar'
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import { fetchCustomScreener } from "../Query/apiScreener"
import { useScreener } from '../hooks/useScreener';
import { useScreenerDefaults } from '../hooks/useScreenerDefaults';
import type { CustomScreener } from '../Types/ScreenerTypes';
import type { StockInfo  } from '../Types/StockInfo';

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

  const { data, error} = useQuery<CustomScreener>({
    queryKey: ["customScreener", id],
    queryFn: () => fetchCustomScreener(id!, apiKey),
  });
  // keep a small debug log for screener data
  useEffect(()=>{ console.log(data) }, [data]);
  

  const [percentThreshold, setPercentThreshold] = useState('');
  const [changePeriod, setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [percentChangeFilter, setPercentChangeFilter] = useState<string>('gt');

  // use the shared hook to fetch stocks
  const { stocks: hookStocks, loading: hookLoading } = useScreener({
    selectedSectors,
    selectedIndustries,
    percentThreshold,
    percentChangeFilter,
    changePeriod,
    max: 10,
    offset: 0,
  });

  // keep local state in sync with hook
  useEffect(() => {
    setStocks(hookStocks);
    setLoading(hookLoading);
  }, [hookStocks, hookLoading]);

  // derive default sectors/industries from screener data
  const { sectors: defaultSectors, industries: defaultIndustries } = useScreenerDefaults(data as any);
  useEffect(() => {
    setSelectedSectors(defaultSectors);
    setSelectedIndustries(defaultIndustries);
  }, [defaultSectors, defaultIndustries]);


useEffect(()=> {
  console.log(error?.message)
}, [error])
  return (
    <div className="min-h-screen bg-[hsl(40,13%,53%)]">
      <NavigationBar />
      <div className="main-content">
        <div className="pt-32 px-8 ScreenerPage-main-layout">
          <div className="w-full flex">
            <StockTable stocks={stocks} loading={loading} onRowClick={(symbol: string) => navigate(`/stock/${symbol}`)} />
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