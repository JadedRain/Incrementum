import React from 'react';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import StockColumn, { StockRowContext } from './StockColumn';

type Stock = {
  symbol?: string | null;
  regularMarketChangePercent?: number | null;
  currentPrice?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  marketCap?: number | null;
  volume?: number | null;
  averageVolume?: number | null;
};

type Props = {
  stock: Stock;
  onClick?: () => void;
  onRemove?: (symbol: string) => void;
  isPending?: boolean;
};

export default function CollectionStockRow({ stock, onClick, onRemove, isPending = false }: Props) {
  const { visibleColumns, columnOrder } = useColumnVisibility();
  const symbol = (stock.symbol || 'N/A').toUpperCase();
  const fiftyTwoWeekHigh = stock.fiftyTwoWeekHigh as number | undefined;
  const fiftyTwoWeekLow = stock.fiftyTwoWeekLow as number | undefined;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPending && onRemove && stock.symbol) {
      onRemove(stock.symbol);
    }
  };

  return (
    <StockRowContext.Provider value={stock}>
      <div className="StockTable-row" onClick={onClick}>
        {columnOrder.map((k) => {
        if (!visibleColumns[k]) return null;
        switch (k) {
          case 'symbol':
            return <StockColumn key={k} variableName="symbol" displayName="Symbol" />;
          case 'price':
            return <StockColumn key={k} variableName="regularMarketPrice" displayName="Price" />;
          case 'high52':
            return <div key={k} className="StockTable-cell text-sm">{fiftyTwoWeekHigh != null ? `$${fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}</div>;
          case 'low52':
            return <div key={k} className="StockTable-cell text-sm">{fiftyTwoWeekLow != null ? `$${fiftyTwoWeekLow.toFixed(2)}` : 'N/A'}</div>;
          case 'percentChange': {
            const percent = stock.regularMarketChangePercent as number | undefined;
            const pctText = percent == null || Number.isNaN(percent)
              ? 'N/A'
              : (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`);
            const pctClass = percent == null || Number.isNaN(percent) ? '' : (percent >= 0 ? 'text-green-500' : 'text-red-500');
            return <div key={k} className={`StockTable-cell ${pctClass}`}>{pctText}</div>;
          }
          case 'volume':
            return <StockColumn key={k} variableName="volume" displayName="Vol." />;
          case 'marketCap':
            return <StockColumn key={k} variableName="marketCap" displayName="Mkt. Cap" />;
          case 'watchlist':
            return onRemove ? (
              <div key={k} className="StockTable-cell">
                <button
                  aria-label={`Remove ${symbol} from collection`}
                  onClick={handleRemoveClick}
                  className={`watch-btn ${isPending ? 'opacity-50' : 'opacity-100'}`}
                  disabled={isPending}
                >
                  −
                </button>
              </div>
            ) : null;
          default:
            return null;
        }
        })}
      </div>
    </StockRowContext.Provider>
  );
}
