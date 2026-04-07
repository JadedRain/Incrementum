import '../styles/NavBar.css'
import { useState } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import Toast from "../Components/Toast";
import { useFetchStockData } from "../hooks/useFetchStockData";
import { useStockPrediction } from "../hooks/useStockPrediction";
import { FilterDataProvider } from '../Context/FilterDataContext';
import InteractiveGraph from "../Components/InteractiveGraph"
import StockInfoSidebar from '../Components/StockInfoSidebar';
import Loading from "../Components/Loading";
import { formatCurrency, formatPercentage } from '../utils/formatUtils';

export default function Stock({ token: propToken }: { token?: string; }) {
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;
  const { results, loading } = useFetchStockData(token);
  const { prediction, loading: predictionLoading, getPrediction } = useStockPrediction();
  const [toast] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("1y");
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const handlePredictPrice = () => {
    if (token) {
      if (!showPredictionModal) {
        getPrediction(token);
      }
      setShowPredictionModal(!showPredictionModal);
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

  const interval = getIntervalForPeriod(period);
  const predictedClosePrices = prediction?.predicted_close_prices ?? [];
  const oneHourPrediction = predictedClosePrices[0] ?? prediction?.predicted_price;
  const twoHourPrediction = predictedClosePrices[1];
  const threeHourPrediction = predictedClosePrices[2];

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

              {/* Prediction Toggle Button */}
              <div className="prediction-toggle-container">
                <button 
                  onClick={handlePredictPrice}
                  className={`prediction-toggle-btn ${showPredictionModal ? 'active' : ''}`}
                  disabled={predictionLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <polyline points="17 5 12 1 7 5"/>
                  </svg>
                  {showPredictionModal ? 'Hide Prediction' : 'Price Prediction'}
                </button>
              </div>

              {/* Prediction Card - Expandable */}
              {showPredictionModal && (
                <div className="prediction-card-inline">
                  {predictionLoading && (
                    <div className="prediction-inline-loading">
                      <div className="prediction-spinner"></div>
                      <span>Analyzing market data...</span>
                    </div>
                  )}

                  {prediction && !predictionLoading && (
                    <div className="prediction-inline-content">
                      <div className="prediction-inline-main">
                        <div className="prediction-inline-stat">
                          <div className="prediction-inline-label">Current</div>
                          <div className="prediction-inline-value">{formatCurrency(prediction.last_close)}</div>
                        </div>
                        <div className="prediction-inline-stat highlight">
                          <div className="prediction-inline-label">Predicted (1hr)</div>
                          <div className="prediction-inline-value-large">{formatCurrency(oneHourPrediction)}</div>
                        </div>
                      </div>

                      {(twoHourPrediction !== undefined || threeHourPrediction !== undefined) && (
                        <div className="prediction-inline-main">
                          {twoHourPrediction !== undefined && (
                            <div className="prediction-inline-stat">
                              <div className="prediction-inline-label">Predicted (2hr)</div>
                              <div className="prediction-inline-value">{formatCurrency(twoHourPrediction)}</div>
                            </div>
                          )}
                          {threeHourPrediction !== undefined && (
                            <div className="prediction-inline-stat">
                              <div className="prediction-inline-label">Predicted (3hr)</div>
                              <div className="prediction-inline-value">{formatCurrency(threeHourPrediction)}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="prediction-inline-change">
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

                      <div className="prediction-inline-footer">
                        <span className="prediction-footer-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                          </svg>
                          Model {prediction.model_version}
                        </span>
                        <span className="prediction-footer-divider">•</span>
                        <span className="prediction-footer-item">
                          {prediction.data_records_used} data points
                        </span>
                      </div>
                    </div>
                  )}
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
              </div>
              <InteractiveGraph 
                height="500px" 
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