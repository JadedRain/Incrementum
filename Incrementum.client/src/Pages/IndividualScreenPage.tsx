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
                  <div className="StockTable-row" key={idx}>
                    <div className="StockTable-cell">{name}</div>
                    <div className="StockTable-cell">{symbol}</div>
                    <div className="StockTable-cell">{symbol[0] || '?'}</div>
                    <div className={`StockTable-cell ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percent >= 0 ? `+${percent}%` : `${percent}%`}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="relative group sidebar-dropdown">
              <button className="sidebar-links sidebar-dropdown-btn">
                Sector
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="sidebar-dropdown-menu">
                <a href="#" className="sidebar-dropdown-item">Sector 1</a>
                <a href="#" className="sidebar-dropdown-item">Sector 2</a>
                <a href="#" className="sidebar-dropdown-item">Sector 3</a>
              </div>
            </div>
            <div className="relative group sidebar-dropdown">
              <button className="sidebar-links sidebar-dropdown-btn">
                Industry
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="sidebar-dropdown-menu">
                <a href="#" className="sidebar-dropdown-item">Industry 1</a>
                <a href="#" className="sidebar-dropdown-item">Industry 2</a>
                <a href="#" className="sidebar-dropdown-item">Industry 3</a>
              </div>
            </div>
            <div className="relative group sidebar-dropdown">
              <button className="sidebar-links sidebar-dropdown-btn">
                Region
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="sidebar-dropdown-menu">
                <a href="#" className="sidebar-dropdown-item">Region 1</a>
                <a href="#" className="sidebar-dropdown-item">Region 2</a>
                <a href="#" className="sidebar-dropdown-item">Region 3</a>
              </div>
            </div>
            <div className="relative group sidebar-dropdown">
              <button className="sidebar-links sidebar-dropdown-btn">
                Market
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="sidebar-dropdown-menu">
                <a href="#" className="sidebar-dropdown-item">Nasdaq</a>
                <a href="#" className="sidebar-dropdown-item">NYSE</a>
                <a href="#" className="sidebar-dropdown-item">AMEX</a>
              </div>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
}

export default IndividualScreenPage;
