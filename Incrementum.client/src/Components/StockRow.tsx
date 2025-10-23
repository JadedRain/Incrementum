import type { StockInfo } from '../Types/StockInfo';

type Props = {
  stock: StockInfo;
  onClick?: () => void;
  idx?: number;
};

export default function StockRow({ stock, onClick }: Props) {
  const name = stock.displayName || stock.longName || stock.shortName || 'Unnamed Stock';
  const symbol = stock.symbol || 'N/A';
  const percent = stock.regularMarketChangePercent as number | undefined;

  return (
    <div className="StockTable-row cursor-pointer" onClick={onClick}>
      <div className="StockTable-cell font-medium">{name}</div>
      <div className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>
      <div className="StockTable-cell">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {symbol[0] || '?'}
        </div>
      </div>
      <div className={`StockTable-cell ${percent != null && percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {percent != null ? (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`) : 'N/A'}
      </div>
    </div>
  );
}
