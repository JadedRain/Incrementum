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
      className="bg-gray-300 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors"
      onClick={handleClick}
    >
      <h2 className="text-lg font-semibold">{symbol}</h2>
      <p className="text-sm">{name}</p>
    </div>
  );
};

export default StockCard;
