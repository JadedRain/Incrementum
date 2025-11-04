import Loading from './Loading';
import StockRow from './StockRow';
import { useFilterData } from '../Context/FilterDataContext';

type Props = {
  onRowClick?: (symbol: string) => void;
};

export default function StockTable({ onRowClick }: Props) {
  const {stocks, isLoading, filterDataDict} = useFilterData()
  return (
    <div className="StockTable-container">
      <div className="StockTable-header-row">
        <div className="StockTable-header">Company</div>
        <div className="StockTable-header">Symbol</div>
        <div className="StockTable-header">Chart</div>
        <div className="StockTable-header">Change</div>
      </div>
      {Object.keys(filterDataDict).length == 0 && <div>Select some filters to get started!</div>}
      <Loading loading={isLoading} />
      {!isLoading && stocks.map((s, idx) => (
        <StockRow key={s.symbol ?? idx} stock={s} onClick={() => onRowClick?.(s.symbol ?? '')} />
      ))}
    </div>
  );
}
