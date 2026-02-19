import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { dashString } from "../Context/FetchingHelper";
import { useTheme } from "../hooks/useTheme";

type Props = {
  url?: string;
  height?: string;
  period?: string;
  interval?: string
};


const InteractiveGraph: React.FC<Props> = ({ url = dashString(), period = "1y", interval = "1d", height = "600px" }) => {
  const { token } = useParams<{ token: string }>();
  const { theme } = useTheme();
  const ticker = token ?? "";
  const [graphType, setGraphType] = useState<'line' | 'candle'>('line');

  const src =
    ticker && ticker.length
      ? `${url}/?ticker=${encodeURIComponent(ticker)}&period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}&type=${graphType}&theme=${theme}`
      : `${url}/?theme=${theme}`;

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
      <iframe
        key={graphType + ticker + theme}
        src={src}
        title="Dash App"
        className="w-full h-full border-0 bg-[var(--bg-surface)]"
        scrolling="no"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
};

export default InteractiveGraph;