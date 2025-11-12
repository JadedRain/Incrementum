type Props = {
  stock: any;
  onClick?: () => void;
  onRemove?: (symbol: string) => void;
  isPending?: boolean;
};

export default function CreateCollectionStockRow({ stock, onClick, onRemove, isPending = false }: Props) {
  const symbol = (stock.symbol || 'N/A').toUpperCase();
  const price = stock.currentPrice as number | undefined;
  // Only symbol and price are needed in the create collection view.

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
