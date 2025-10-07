import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import Loading from '../Components/Loading';
import Sidebar from '../Components/Sidebar';
import NavigationBar from '../Components/NavigationBar';
import '../App.css';

interface StockInfo {
  displayName?: string;
  longName?: string;
  shortName?: string;
  symbol?: string;
  percentChange?: number;
}

function IndividualScreenPage() {
  const { screenerName } = useParams();
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [percentThreshold, setPercentThreshold] = useState('');
  const [changePeriod, setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [percentChangeFilter, setPercentChangeFilter] = useState<string>('gt');

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
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
        setStocks((data.stocks || []).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [selectedSectors, selectedIndustries, percentThreshold, percentChangeFilter, changePeriod]);

  return (
    <div className="min-h-screen bg-[hsl(40,62%,26%)]">
      <NavigationBar />
      <div className="main-content">
        <div className="pt-32 px-8 ScreenerPage-main-layout">
          <div className="w-full">
            <div className="StockTable-container">
              <div className="StockTable-header-row">
                <div className="StockTable-header">Stock Name</div>
                <div className="StockTable-header">Symbol</div>
                <div className="StockTable-header">Graph</div>
                <div className="StockTable-header">% Change</div>
              </div>
              <Loading loading={loading} watchlist={[]} showEmpty={false} />
              {!loading &&
                stocks.map((item, idx) => {
                  const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
                  const symbol = item.symbol || 'N/A';
                  const percent = typeof item.currentPrice === 'number' && typeof item.previousClose === 'number' && item.previousClose !== 0
                    ? ((item.currentPrice - item.previousClose) / item.previousClose) * 100
                    : idx % 2 === 0 ? 1.23 : -0.56;
                  return (
                    <div className="StockTable-row cursor-pointer hover:shadow-[0_4px_24px_0_hsl(41,11%,45%)] transition-shadow duration-200" key={idx} onClick={() => navigate(`/stock/${symbol}`)}>
                      <div className="StockTable-cell">{name}</div>
                      <div className="StockTable-cell">{symbol}</div>
                      <div className="StockTable-cell">{symbol[0] || '?'}</div>
                      <div className={`StockTable-cell ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`}
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
