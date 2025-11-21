import { useColumnVisibility } from '../Context/useColumnVisibility';

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
  const percent = stock.regularMarketChangePercent as number | undefined;
  const price = stock.currentPrice as number | undefined;
  const fiftyTwoWeekHigh = stock.fiftyTwoWeekHigh as number | undefined;
  const fiftyTwoWeekLow = stock.fiftyTwoWeekLow as number | undefined;
  const marketCap = stock.marketCap as number | undefined;
  const volume = (stock.volume ?? stock.averageVolume) as number | undefined;

  const formatLarge = (v?: number) => {
    if (v == null || Number.isNaN(v)) return 'N/A';
    const abs = Math.abs(v);
    if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${(v / 1_000).toFixed(2)}K`;
    return v.toString();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPending && onRemove && stock.symbol) {
      onRemove(stock.symbol);
    }
  };

  return (
    <div className="StockTable-row" onClick={onClick}>
      {columnOrder.map((k) => {
        if (!visibleColumns[k]) return null;
        switch (k) {
          case 'symbol':
            return <div key={k} className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>;
          case 'price':
            return <div key={k} className="StockTable-cell font-medium">{price != null ? `$${price.toFixed(2)}` : 'N/A'}</div>;
          case 'high52':
            return <div key={k} className="StockTable-cell text-sm">{fiftyTwoWeekHigh != null ? `$${fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}</div>;
          case 'low52':
            return <div key={k} className="StockTable-cell text-sm">{fiftyTwoWeekLow != null ? `$${fiftyTwoWeekLow.toFixed(2)}` : 'N/A'}</div>;
          case 'percentChange':
            return <div key={k} className={`StockTable-cell ${percent != null && percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>{percent != null ? (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`) : 'N/A'}</div>;
          case 'volume':
            return <div key={k} className="StockTable-cell">{formatLarge(volume)}</div>;
          case 'marketCap':
            return <div key={k} className="StockTable-cell">{formatLarge(marketCap)}</div>;
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
  );
}
