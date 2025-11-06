import Loading from './Loading';
import StockRow from './StockRow';

import { useFilterData } from '../Context/FilterDataContext';

type Props = {
  onRowClick?: (symbol: string) => void;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (symbol: string, inWatchlist: boolean) => void;
  pendingSymbol?: string | null;
};

export default function StockTable({ onRowClick, watchlistSymbols, onToggleWatchlist, pendingSymbol  }: Props) {
  const {stocks, isLoading, filterDataDict} = useFilterData()
  
  const filteredStocks = stocks.filter((s) => {
    const price = s.regularMarketPrice as number | undefined;
    const percent = s.regularMarketChangePercent as number | undefined;
    const marketCap = s.marketCap as number | undefined;
    const volume = (s.regularMarketVolume ?? s.averageDailyVolume3Month ?? s.averageVolume ?? s.volume) as number | undefined;
    
    return price != null && !Number.isNaN(price) &&
           percent != null && !Number.isNaN(percent) &&
           marketCap != null && !Number.isNaN(marketCap) &&
           volume != null && !Number.isNaN(volume);
  });
  
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
      <Loading loading={isLoading} />
      {Object.keys(filterDataDict).length == 0 && <div>Select some filters to get started!</div>}
      {!isLoading && filteredStocks.map((s, idx) => (
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
