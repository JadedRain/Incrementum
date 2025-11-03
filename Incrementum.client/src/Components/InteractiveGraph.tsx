import React from "react";
import { useParams } from "react-router-dom";

type Props = {
  url?: string;
  height?: string;
  period?: string;
  interval?: string
};

const InteractiveGraph: React.FC<Props> = ({ url = "http://localhost:8050", period = "1y", interval = "1d", height = "600px" }) => {
  const { token } = useParams<{ token: string }>();
  const ticker = token ?? "";

  const src =
    ticker && ticker.length
      ? `${url}/?ticker=${encodeURIComponent(ticker)}&period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`
      : `${url}/`;

  return (
    <div style={{ width: "100%", height }}>
      <iframe
        src={src}
        title="Dash App"
        style={{ width: "100%", height: "100%", border: "none" }}
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
};

export default InteractiveGraph;