import '../styles/NavBar.css'
import { useState } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import Toast from "../Components/Toast";
import { useFetchStockData } from "../hooks/useFetchStockData";
import { useStockPrediction } from "../hooks/useStockPrediction";
import { useFetchUserStockPotentials } from "../hooks/useFetchUserStockPotentials";
import { useAuth } from '../Context/AuthContext';
import { FilterDataProvider } from '../Context/FilterDataContext';
import InteractiveGraph from "../Components/InteractiveGraph"
import StockInfoSidebar from '../Components/StockInfoSidebar';
import UserStockPotentialsTable from '../Components/UserStockPotentialsTable';
import Loading from "../Components/Loading";
import { formatCurrency, formatPercentage } from '../utils/formatUtils';

export default function Stock({ token: propToken }: { token?: string; }) {
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;
  const { apiKey } = useAuth();
  const { results, loading } = useFetchStockData(token);
  const { prediction, loading: predictionLoading, getPrediction } = useStockPrediction();
  const [refreshKey, setRefreshKey] = useState(0);
  const { potentials, loading: potentialsLoading, error: potentialsError } = useFetchUserStockPotentials(token, apiKey, refreshKey);
  const [toast] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("1y");
  const [showForecastLine, setShowForecastLine] = useState(false);

  const handleRefreshPotentials = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleForecastToggle = () => {
    if (token) {
      if (!showForecastLine && !predictionLoading && !prediction) {
        getPrediction(token);
      }
      setShowForecastLine(!showForecastLine);
    }
  };

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

  const effectivePeriod = showForecastLine ? "1d" : period;
  const interval = showForecastLine ? "1h" : getIntervalForPeriod(period);
  const predictedClosePrices = (prediction?.predicted_close_prices?.length
    ? prediction.predicted_close_prices
    : (prediction?.predicted_price !== undefined ? [prediction.predicted_price] : [])).slice(0, 3);
  const oneHourPrediction = predictedClosePrices[0] ?? prediction?.predicted_price;

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
              aria-label="Go back"
            >
              ← 
            </button>
          </div>

          {/* Financial Data Section */}
          {results.currentPrice !== undefined && results.currentPrice !== null ? (
            <div className="stock-financials">
              <div className="stock-financials-header">
                <h3>Market Data</h3>
              </div>

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

              {showForecastLine && prediction && (
                <div className="prediction-inline-change" style={{ marginTop: '12px' }}>
                  <div className={`prediction-inline-badge ${((oneHourPrediction ?? prediction.last_close) - prediction.last_close) >= 0 ? 'positive' : 'negative'}`}>
                    <span className="prediction-badge-icon">
                      {((oneHourPrediction ?? prediction.last_close) - prediction.last_close) >= 0 ? '↑' : '↓'}
                    </span>
                    <span className="prediction-badge-value">
                      {formatCurrency(Math.abs((oneHourPrediction ?? prediction.last_close) - prediction.last_close))}
                    </span>
                    <span className="prediction-badge-percent">
                      {formatPercentage((((oneHourPrediction ?? prediction.last_close) - prediction.last_close) / prediction.last_close) * 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="stock-page-body">
            <div className="stock-page-sidebar">
              <StockInfoSidebar results={results} />
            </div>
            <div className="stock-page-graph">
              <div className="flex gap-3 mt-1 mb-3">
                {!showForecastLine && (
                  <div>
                    <select
                      id="period"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="stock-period-select"
                    >
                      <option value="1d">1 Day</option>
                      <option value="5d">5 Days</option>
                      <option value="1mo">1 Month</option>
                      <option value="6mo">6 Months</option>
                      <option value="1y">1 Year</option>
                      <option value="2y">2 Years</option>
                    </select>
                  </div>
                )}
              </div>
              <InteractiveGraph 
                height="500px" 
                period={effectivePeriod}
                interval={interval}
                showForecast={showForecastLine}
                forecastClosePrices={predictedClosePrices}
                onForecastToggle={handleForecastToggle}
                forecastLoading={predictionLoading}
              />
            </div>
          </div>

          {/* User Stock Potentials Section */}
          <UserStockPotentialsTable
            potentials={potentials}
            loading={potentialsLoading}
            error={potentialsError}
            stockSymbol={token || ''}
            apiKey={apiKey}
            onRefresh={handleRefreshPotentials}
          />
        </div>
      </div>
    </FilterDataProvider>
  );
}