import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { dashString } from "../Context/FetchingHelper";

type Props = {
  url?: string;
  height?: string;
  period?: string;
  interval?: string
};


const InteractiveGraph: React.FC<Props> = ({ url = dashString(), period = "1y", interval = "1d", height = "600px" }) => {
  const { token } = useParams<{ token: string }>();
  const ticker = token ?? "";
  const [graphType, setGraphType] = useState<'line' | 'candle'>('line');

  const src =
    ticker && ticker.length
      ? `${url}/?ticker=${encodeURIComponent(ticker)}&period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}&type=${graphType}`
      : `${url}/`;

  return (
    <div style={{ width: "100%", height }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={() => setGraphType(graphType === 'line' ? 'candle' : 'line')}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid #bfa76a',
            background: graphType === 'line' ? '#f5e6c5' : '#e0c48f',
            color: '#5a4a1b',
            fontWeight: 600,
            cursor: 'pointer',
            marginRight: 8
          }}
        >
          {graphType === 'line' ? 'Show Candlestick' : 'Show Line Graph'}
        </button>
      </div>
      <iframe
        key={graphType + ticker}
        src={src}
        title="Dash App"
        className="w-full h-full border-0  bg-[hsl(40, 63%, 63%)]"
        scrolling="no"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
};

export default InteractiveGraph;