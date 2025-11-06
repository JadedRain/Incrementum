import '../styles/Stocks/StockCard.css'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../Context/AuthContext';
import { useFetchWatchlist } from '../useFetchWatchlist';
import { addToWatchlist, removeFromWatchlist } from '../utils/watchlistActions';

interface StockCardProps {
  symbol: string;
  name: string;
}

const StockCard: React.FC<StockCardProps> = ({ symbol, name, setToast }) => {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const { watchlistSymbols, setWatchlistSymbols } = useFetchWatchlist(apiKey);
  const [pending, setPending] = useState<null | string>(null);

  const handleClick = () => {
    navigate(`/stock/${symbol}`);
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!symbol || !apiKey) return;
    if (pending) return;
    const toastSetter = setToast ?? (() => {});
    if (watchlistSymbols.has(symbol)) {
      await removeFromWatchlist(symbol, apiKey, setPending, toastSetter, undefined, setWatchlistSymbols);
    } else {
      await addToWatchlist(symbol, apiKey, setPending, toastSetter, undefined, setWatchlistSymbols);
    }
  };

  const inWatchlist = !!(symbol && watchlistSymbols && watchlistSymbols.has(symbol));

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
        {apiKey && (
          <button
            className="card-action"
            aria-label={`${inWatchlist ? 'Remove' : 'Add'} ${symbol}`}
            onClick={handleToggle}
            disabled={pending === symbol}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {inWatchlist ? '−' : '+'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StockCard;