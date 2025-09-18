import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Loading from '../Components/Loading';
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
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('/getStockInfo/');
        const data = await response.json();
        setStocks(data.stocks.slice(0, 4)); // Only show first 4 stocks
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-600">
      <div className="ScreenerPage-header">
        <button className="ScreenerPage-button" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="ScreenerPage-h1">{screenerName}</h1>
        <div className="w-20 mr-8 bg-gray-600"></div>
      </div>
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
                const percent = typeof item.percentChange === 'number' ? item.percentChange : idx % 2 === 0 ? 1.23 : -0.56; // fallback
                return (
                  <div className="StockTable-row cursor-pointer hover:shadow-[0_4px_24px_0_hsl(41,11%,45%)] transition-shadow duration-200" key={idx} onClick={() => navigate(`/stock/${symbol}`)}>
                    <div className="StockTable-cell">{name}</div>
                    <div className="StockTable-cell">{symbol}</div>
                    <div className="StockTable-cell">{symbol[0] || '?'}</div>
                    <div className={`StockTable-cell ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percent >= 0 ? `+${percent}%` : `${percent}%`}x
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <a href="#" className="sidebar-links">
              x
            </a>
            <a href="#" className="sidebar-links">
              y
            </a>
            <a href="#" className="sidebar-links">
              z
            </a>
            <a href="#" className="sidebar-links">
              v
            </a>
            <a href="#" className="sidebar-links">
              c
            </a>
          </nav>
        </aside>
      </div>
    </div>
  );
}

export default IndividualScreenPage;
