import Loading from './Loading';
import StockRow from './StockRow';
import type { StockInfo } from '../Types/StockInfo';

type Props = {
  stocks: StockInfo[];
  loading: boolean;
  onRowClick?: (symbol: string) => void;
};

export default function StockTable({ stocks, loading, onRowClick }: Props) {
  return (
    <div className="StockTable-container">
      <div className="StockTable-header-row">
        <div className="StockTable-header">Company</div>
        <div className="StockTable-header">Symbol</div>
        <div className="StockTable-header">Chart</div>
        <div className="StockTable-header">Change</div>
      </div>
      <Loading loading={loading} />
      {!loading && stocks.map((s, idx) => (
        <StockRow key={s.symbol ?? idx} stock={s} onClick={() => onRowClick?.(s.symbol ?? '')} />
      ))}
    </div>
  );
}
