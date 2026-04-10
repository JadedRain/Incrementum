import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StockChart from "./StockChart";

type Props = {
  url?: string;
  height?: string;
  period?: string;
  interval?: string;
  showForecast?: boolean;
  forecastClosePrices?: number[];
  onForecastToggle?: () => void;
  forecastLoading?: boolean;
};


const InteractiveGraph: React.FC<Props> = ({
  period = "1y",
  interval = "1d",
  height = "600px",
  showForecast = false,
  forecastClosePrices = [],
  onForecastToggle,
  forecastLoading = false,
}) => {
  const { token } = useParams<{ token: string }>();
  const ticker = token ?? "";
  const [graphType, setGraphType] = useState<'line' | 'candle'>('line');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (showForecast && graphType === 'candle') {
      setGraphType('line');
    }
  }, [showForecast, graphType]);

  const handleDateRangeChange = (start: string, end: string) => {
    // Convert to date format for input fields (YYYY-MM-DD)
    const formatForInput = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };
    
    setStartDate(formatForInput(start));
    setEndDate(formatForInput(end));
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  if (!ticker) {
    return (
      <div className="interactive-graph-wrapper" style={{ height }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p>Please select a stock to view its chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-graph-wrapper" style={{ height }}>
      <div className="interactive-graph-toolbar">
        <div className="date-range-controls">
          <label className="date-input-label">
            Start Date:
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="date-input-label">
            End Date:
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          {(startDate || endDate) && (
            <button
              className="interactive-graph-btn reset-btn"
              onClick={handleReset}
              title="Reset date range"
            >
              Reset
            </button>
          )}
          <span className="graph-instruction-text">
            💡 Click two points on the graph to select a date range
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="interactive-graph-btn"
            onClick={onForecastToggle}
            disabled={forecastLoading}
          >
            {forecastLoading ? 'Loading Forecast...' : (showForecast ? 'Hide 3hr Forecast' : 'Show 3hr Forecast')}
          </button>
          <button
            className="interactive-graph-btn"
            onClick={() => setGraphType(graphType === 'line' ? 'candle' : 'line')}
            disabled={showForecast}
            title={showForecast ? 'Disable forecast to use candlestick view' : undefined}
          >
            {graphType === 'line' ? 'Show Candlestick' : 'Show Line Graph'}
          </button>
        </div>
      </div>
      <StockChart
        ticker={ticker}
        period={period}
        interval={interval}
        chartType={graphType}
        height={`calc(${height} - 50px)`}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
        showForecast={showForecast}
        forecastClosePrices={forecastClosePrices}
      />
    </div>
  );
};

export default InteractiveGraph;