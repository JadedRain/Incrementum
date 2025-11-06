import '../styles/Stocks/StockCard.css'
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

  const handleAdd = () => {
    
  }

  return (
    <div
      className="search-stock-card newsreader-font"
      onClick={handleClick}
    >
      <div className="card-content">
        <div className="text-stack">
          <p className="StockTable-cell name-cell">{name}</p>
          <div className="StockTable-cell font-mono symbol-cell">{symbol}</div>
        </div>
        <button
          className="card-action"
          aria-label={`Add ${symbol}`}
          onClick={(e) => { e.stopPropagation(); console.log('plus clicked', symbol); }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default StockCard;
