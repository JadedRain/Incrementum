type Props = {
  stock: any;
  onClick?: () => void;
  onRemove?: (symbol: string) => void;
  isPending?: boolean;
};

export default function CollectionStockRow({ stock, onClick, onRemove, isPending = false }: Props) {
  const symbol = (stock.symbol || 'N/A').toUpperCase();
  const percent = stock.regularMarketChangePercent as number | undefined;
  const price = stock.currentPrice as number | undefined;
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
      <div className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>
      <div className="StockTable-cell font-medium">{price != null ? `$${price.toFixed(2)}` : 'N/A'}</div>
      <div className={`StockTable-cell ${percent != null && percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {percent != null ? (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`) : 'N/A'}
      </div>
      <div className="StockTable-cell">{formatLarge(volume)}</div>
      <div className="StockTable-cell">{formatLarge(marketCap)}</div>
      <div className="StockTable-cell">
        <button
          aria-label={`Remove ${symbol} from collection`}
          onClick={handleRemoveClick}
          className='watch-btn'
          disabled={isPending}
          style={{ opacity: isPending ? 0.5 : 1 }}
        >
          −
        </button>
      </div>
    </div>
  );
}
