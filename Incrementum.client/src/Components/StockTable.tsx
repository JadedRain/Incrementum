import { useState } from 'react';
import Loading from './Loading';
import StockRow from './StockRow';

import { useFilterData } from '../Context/FilterDataContext';
import { sortStocks, getNextSortDirection, type SortField, type SortDirection } from '../utils/sortingUtils';

type Props = {
  onRowClick?: (symbol: string) => void;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (symbol: string, inWatchlist: boolean) => void;
  pendingSymbol?: string | null;
};

export default function StockTable({ onRowClick, watchlistSymbols, onToggleWatchlist, pendingSymbol  }: Props) {
  const {stocks, isLoading, filterDataDict} = useFilterData();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const handleHeaderClick = (field: SortField) => {
    const nextDirection = getNextSortDirection(sortField, field, sortDirection);
    setSortField(nextDirection === null ? null : field);
    setSortDirection(nextDirection);
  };
  
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    if (sortDirection === 'asc') return ' ▲';
    if (sortDirection === 'desc') return ' ▼';
    return '';
  };
  
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
  
  // Apply sorting if a sort field is selected
  const displayStocks = sortField && sortDirection 
    ? sortStocks(filteredStocks, sortField, sortDirection)
    : filteredStocks;
  
  const showWatchlist = !!onToggleWatchlist;
  
  return (
    <div className="StockTable-container">
      <div className="StockTable-header-row">
           <div className="StockTable-header sortable" onClick={() => handleHeaderClick('name')}>
             Symbol{getSortIndicator('name')}
           </div>
           <div className="StockTable-header sortable" onClick={() => handleHeaderClick('price')}>
             Price{getSortIndicator('price')}
           </div>
           <div className="StockTable-header">52W High</div>
           <div className="StockTable-header">52W Low</div>
           <div className="StockTable-header sortable" onClick={() => handleHeaderClick('percentChange')}>
             1 Day % Chg.{getSortIndicator('percentChange')}
           </div>
           <div className="StockTable-header sortable" onClick={() => handleHeaderClick('volume')}>
             Vol.{getSortIndicator('volume')}
           </div>
           <div className="StockTable-header sortable" onClick={() => handleHeaderClick('marketCap')}>
             Mkt. Cap{getSortIndicator('marketCap')}
           </div>
           {showWatchlist && <div className="StockTable-header">Add to Watchlist</div>}
      </div>
      <Loading loading={isLoading} />
      {Object.keys(filterDataDict).length == 0 && <div>Select some filters to get started!</div>}
      {!isLoading && displayStocks.map((s, idx) => (
        <StockRow 
          key={s.symbol ?? idx} 
          stock={s} 
          onClick={() => onRowClick?.(s.symbol ?? '')}
          inWatchlist={watchlistSymbols?.has(s.symbol ?? '') ?? false}
          onToggleWatchlist={showWatchlist ? onToggleWatchlist : undefined}
          isPending={pendingSymbol === s.symbol}
        />
      ))}
    </div>
  );
}
