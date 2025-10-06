import React from "react";
import { useNavigate } from "react-router-dom";

interface StockCardProps {
  symbol: string;
  name: string;
}

const StockCard: React.FC<StockCardProps> = ({ symbol, name }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/stock/${symbol}`);
  };

  return (
    <div
      className="search-stock-card newsreader-font"
      onClick={handleClick}
    >
      <h2 className="text-lg font-semibold">{symbol}</h2>
      <p className="text-sm">{name}</p>
    </div>
  );
};

export default StockCard;
