import React from "react";

type Props = {
  country?: string;
  url?: string;
  height?: string;
};

const InteractiveGraph: React.FC<Props> = ({ country = "Canada", url = "http://localhost:8050", height = "600px" }) => {
  // include country as query param so Dash can optionally read it
  const src = `${url}/?country=${encodeURIComponent(country)}`;
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