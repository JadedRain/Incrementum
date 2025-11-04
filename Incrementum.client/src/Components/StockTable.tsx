import Loading from './Loading';
import StockRow from './StockRow';
import type { StockInfo } from '../Types/StockInfoTypes';

type Props = {
  stocks: StockInfo[];
  loading: boolean;
  onRowClick?: (symbol: string) => void;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (symbol: string, inWatchlist: boolean) => void;
  pendingSymbol?: string | null;
};

export default function StockTable({ stocks, loading, onRowClick, watchlistSymbols, onToggleWatchlist, pendingSymbol }: Props) {
  return (
    <div className="StockTable-container">
      <div className="StockTable-header-row">
           <div className="StockTable-header">Symbol</div>
           <div className="StockTable-header">Price</div>
           <div className="StockTable-header">1 Day % Chg.</div>
           <div className="StockTable-header">Vol.</div>
           <div className="StockTable-header">Mkt. Cap</div>
           <div className="StockTable-header">Add to Watchlist</div>
      </div>
      <Loading loading={loading} />
      {!loading && stocks.map((s, idx) => (
        <StockRow 
          key={s.symbol ?? idx} 
          stock={s} 
          onClick={() => onRowClick?.(s.symbol ?? '')}
          inWatchlist={watchlistSymbols?.has(s.symbol ?? '') ?? false}
          onToggleWatchlist={onToggleWatchlist}
          isPending={pendingSymbol === s.symbol}
        />
      ))}
    </div>
  );
}
