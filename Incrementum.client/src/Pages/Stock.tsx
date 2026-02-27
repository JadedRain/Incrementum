import '../styles/NavBar.css'
import { useState } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import Toast from "../Components/Toast";
import { useFetchStockData } from "../hooks/useFetchStockData";
import { FilterDataProvider } from '../Context/FilterDataContext';
import InteractiveGraph from "../Components/InteractiveGraph"
import StockInfoSidebar from '../Components/StockInfoSidebar';
import Loading from "../Components/Loading";
import { formatCurrency, formatPercentage } from '../utils/formatUtils';

export default function Stock({ token: propToken }: { token?: string; }) {
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;
  const { results, loading } = useFetchStockData(token);
  const [toast] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("1y");

  const getIntervalForPeriod = (period: string): string => {
    switch (period) {
      case "1d":
        return "5m";
      case "5d":
        return "15m";
      case "1mo":
      case "6mo":
      case "1y":
      case "2y":
        return "1d";
      default:
        return "1d";
    }
  };

  const interval = getIntervalForPeriod(period);

  if (loading) return <div className="stock-page-loading"><Loading loading={true} /></div>;
  if (!results) return <div className="stock-page-loading"><p>No stock data found.</p></div>;

  return (
    <FilterDataProvider>
      <div className="stock-page-wrapper">
        <NavigationBar />
        <div className="stock-page-content">
          <Toast message={toast} />

          <div className="stock-page-header">
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              ← Back
            </button>
          </div>

          {/* Financial Data Section */}
          {results.currentPrice !== undefined && results.currentPrice !== null ? (
            <div className="stock-financials">
              <div className="stock-financials-grid">
                <div className="stock-financials-item">
                  <span className="stock-financials-label">Current Price</span>
                  <span className="stock-financials-value">
                    {formatCurrency(results.currentPrice)}
                  </span>
                </div>
                <div className="stock-financials-item">
                  <span className="stock-financials-label">Change</span>
                  <span className={`stock-financials-value ${results.change !== null && results.change !== undefined && results.change >= 0 ? 'positive' : 'negative'}`}>
                    {results.change !== null && results.change !== undefined ? formatCurrency(Math.abs(results.change)) : 'N/A'}
                    {results.changePercent !== null && results.changePercent !== undefined && ` (${formatPercentage(results.changePercent)})`}
                  </span>
                </div>
                <div className="stock-financials-item">
                  <span className="stock-financials-label">Open</span>
                  <span className="stock-financials-value">
                    {formatCurrency(results.open)}
                  </span>
                </div>
                <div className="stock-financials-item">
                  <span className="stock-financials-label">Previous Close</span>
                  <span className="stock-financials-value">
                    {formatCurrency(results.previousClose)}
                  </span>
                </div>
                <div className="stock-financials-item">
                  <span className="stock-financials-label">Day High</span>
                  <span className="stock-financials-value">
                    {formatCurrency(results.high)}
                  </span>
                </div>
                <div className="stock-financials-item">
                  <span className="stock-financials-label">Day Low</span>
                  <span className="stock-financials-value">
                    {formatCurrency(results.low)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="stock-page-body">
            <div className="stock-page-sidebar">
              <StockInfoSidebar results={results} />
            </div>
            <div className="stock-page-graph">
              <div className="flex gap-4 mt-2 mb-4">
                <div>
                  <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded p-2 border border-gray-300"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <option value="1d">1 Day</option>
                    <option value="5d">5 Days</option>
                    <option value="1mo">1 Month</option>
                    <option value="6mo">6 Months</option>
                    <option value="1y">1 Year</option>
                    <option value="2y">2 Years</option>
                  </select>
                </div>
              </div>
              <InteractiveGraph 
                height="800px" 
                period={period}
                interval={interval}
              />
            </div>
          </div>
        </div>
      </div>
    </FilterDataProvider>
  );
}