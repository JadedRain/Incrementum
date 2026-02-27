import React, { useState } from "react";
import { useParams } from "react-router-dom";
import StockChart from "./StockChart";

type Props = {
  url?: string;
  height?: string;
  period?: string;
  interval?: string
};


const InteractiveGraph: React.FC<Props> = ({ period = "1y", interval = "1d", height = "600px" }) => {
  const { token } = useParams<{ token: string }>();
  const ticker = token ?? "";
  const [graphType, setGraphType] = useState<'line' | 'candle'>('line');

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
        <button
          className="interactive-graph-btn"
          onClick={() => setGraphType(graphType === 'line' ? 'candle' : 'line')}
        >
          {graphType === 'line' ? 'Show Candlestick' : 'Show Line Graph'}
        </button>
      </div>
      <StockChart
        ticker={ticker}
        period={period}
        interval={interval}
        chartType={graphType}
        height={`calc(${height} - 50px)`}
      />
    </div>
  );
};

export default InteractiveGraph;