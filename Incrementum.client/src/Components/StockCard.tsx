import '../styles/Stocks/StockCard.css'
import React from "react";
import { useNavigate } from "react-router-dom";

interface StockCardProps {
  symbol: string;
  name: string;
  setToast?: (msg: string | null) => void;
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
      <div className="card-content">
        <div className="text-stack">
            <div className="field">
              <p className="StockTable-cell name-cell">{name}</p>
              <div className="StockTable-cell font-mono symbol-cell">{symbol}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;