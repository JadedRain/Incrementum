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
  regularMarketChangePercent?: number;
  currentPrice?: number;
}

function IndividualScreenPage() {
  const { screenerName } = useParams();
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

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
        if (Object.keys(filters).length) params.set('filters', JSON.stringify(filters));
        const response = await fetch(`/getStockInfo/?${params.toString()}`);
        const data = await response.json();
        setStocks((data.stocks || []).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [selectedSectors, selectedIndustries]);

  return (
    <div className="min-h-screen bg-[hsl(40,62%,26%)]">
      <NavigationBar />
      <div className="main-content">
      <div className="pt-32 px-8 ScreenerPage-main-layout">
        <div className="w-full">
          <div className="StockTable-container">
            <div className="StockTable-header-row">
              <div className="StockTable-header">Company</div>
              <div className="StockTable-header">Symbol</div>
              <div className="StockTable-header">Chart</div>
              <div className="StockTable-header">Change</div>
            </div>
            <Loading loading={loading} watchlist={[]} showEmpty={false} />
            {!loading &&
              stocks.map((item, idx) => {
                const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
                const symbol = item.symbol || 'N/A';
                // yfinance returns percentage directly (e.g., 2.11 = 2.11%)
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
                      {percent != null ? 
                        (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`) : 
                        'N/A'
                      }
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
            showCustomScreenerSection={true}
            apiKey={apiKey || undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default IndividualScreenPage;
