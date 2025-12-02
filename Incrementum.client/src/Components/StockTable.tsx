import { useState } from 'react';
import Loading from './Loading';
import StockRow from './StockRow';
import { useFilterData } from '../Context/FilterDataContext';
import ColumnVisibilityProvider from '../Context/ColumnVisibilityContext';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import { getNextSortDirection, sortStocks, type SortField, type SortDirection } from '../utils/sortingUtils';
import '../styles/stock-table-extras.css';

type Stock = {
  symbol?: string;
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  averageVolume?: number;
  volume?: number;
};

type ColKey = 'symbol' | 'price' | 'high52' | 'low52' | 'percentChange' | 'volume' | 'marketCap' | 'watchlist';
type Col = { k: ColKey; l: string };

type Props = { onRowClick?: (s: string) => void; watchlistSymbols?: Set<string>; onToggleWatchlist?: (s: string, inW: boolean) => void; pendingSymbol?: string | null };

export default function StockTable({ onRowClick, watchlistSymbols, onToggleWatchlist, pendingSymbol }: Props) {
  const { stocks, isLoading, filterDataDict } = useFilterData();
  const showWatch = !!onToggleWatchlist;

  const cols: Col[] = [
    { k: 'symbol', l: 'Symbol' },
    { k: 'price', l: 'Price' },
    { k: 'high52', l: '52W High' },
    { k: 'low52', l: '52W Low' },
    { k: 'percentChange', l: '1 Day % Chg.' },
    { k: 'volume', l: 'Vol.' },
    { k: 'marketCap', l: 'Mkt. Cap' },
  ];

  return (
    <ColumnVisibilityProvider showWatchlist={showWatch}>
      <InnerStockTable onRowClick={onRowClick} watchlistSymbols={watchlistSymbols} onToggleWatchlist={onToggleWatchlist} pendingSymbol={pendingSymbol} cols={cols} stocks={stocks} isLoading={isLoading} filterDataDict={filterDataDict} />
    </ColumnVisibilityProvider>
  );
}

function InnerStockTable({ onRowClick, watchlistSymbols, onToggleWatchlist, pendingSymbol, cols, stocks, isLoading, filterDataDict }: {
  onRowClick?: (s: string) => void;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (s: string, inW: boolean) => void;
  pendingSymbol?: string | null;
  cols: Col[];
  stocks: Stock[] | unknown;
  isLoading: boolean;
  filterDataDict: Record<string, unknown>;
}) {
  const { visibleColumns, toggleColumn, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn } = useColumnVisibility();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const colToSortField = (k: string): SortField | null => {
    switch (k) {
      case 'symbol':
        return 'name';
      case 'price':
        return 'price';
      case 'percentChange':
        return 'percentChange';
      case 'volume':
        return 'volume';
      case 'marketCap':
        return 'marketCap';
      default:
        return null;
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    if (sortDirection === 'asc') return ' ▲';
    if (sortDirection === 'desc') return ' ▼';
    return '';
  };

  const handleHeaderClick = (field: SortField) => {
    const nextDirection = getNextSortDirection(sortField, field, sortDirection);
    setSortField(nextDirection === null ? null : field);
    setSortDirection(nextDirection);
  };
  const btnStyle = 'bg-transparent border-none cursor-pointer p-1';
  const menuStyle = 'absolute right-0 mt-1 bg-[#e6c884] rounded-lg shadow-lg p-3 min-w-[240px]';

  return (
    <div className="StockTable-container stocktable-flex">
      <div className="StockTable-header-row relative">
        <div className="absolute right-2 top-1 z-10">
          <button ref={btnRef} aria-label="Columns" onClick={() => setMenuOpen(!menuOpen)} className={btnStyle}><span className="text-[20px]">⋮</span></button>
          {menuOpen && (
            <div ref={menuRef} className={menuStyle}>
              <div className="font-bold mb-2 text-[15px] text-[#3f2a10]">Columns</div>
              {cols.filter(c => c.k !== 'symbol' && c.k !== 'watchlist').map((c: Col) => (
                <label key={c.k} className="flex items-center gap-3 mb-2">
                  <input className="transform scale-125 accent-[#6b4c1b]" type="checkbox" checked={!!visibleColumns[c.k]} onChange={() => toggleColumn(c.k)} />
                  <span className="text-[15px] text-[#3f2a10]">{c.l}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {columnOrder.map((k, idx) => {
          // determine label for key
          const labelMap: Record<string, string> = Object.fromEntries(cols.map(c => [c.k, c.l]));
          labelMap.watchlist = 'Add to Watchlist';
          if (!visibleColumns[k]) return null;
          // Don't render watchlist header if onToggleWatchlist isn't provided (not logged in)
          if (k === 'watchlist' && !onToggleWatchlist) return null;
          const isWatch = k === 'watchlist';
          const draggable = !isWatch; // watchlist must be non-draggable
          const sortableField = colToSortField(k);
          return (
            <div
              key={k}
              className={`StockTable-header ${draggable ? 'cursor-grab' : 'cursor-default'}`}
              draggable={draggable}
              data-index={idx}
              onDragStart={(e) => {
                if (!draggable) return;
                e.dataTransfer?.setData('text/plain', String(idx));
                e.dataTransfer!.effectAllowed = 'move';
              }}
              onDragOver={(e) => { if (draggable) e.preventDefault(); }}
              onDrop={(e) => {
                if (!draggable) return;
                const from = Number(e.dataTransfer?.getData('text/plain'));
                const to = idx;
                if (!Number.isNaN(from) && from !== to) moveColumn(from, to);
              }}
              onClick={() => { if (sortableField) handleHeaderClick(sortableField); }}
              role={sortableField ? 'button' : undefined}
              style={{ cursor: sortableField ? 'pointer' : draggable ? 'grab' : 'default' }}
            >
              {(labelMap[k] ?? k) + (sortableField ? getSortIndicator(sortableField) : '')}
            </div>
          );
        })}
      </div>
      <Loading loading={isLoading} />
      {Object.keys(filterDataDict).length == 0 && <div>Select some filters to get started!</div>}
      {!isLoading && (() => {
        const items: Stock[] = Array.isArray(stocks) ? (stocks as Stock[]) : [];
        const displayItems = (sortField && sortDirection) ? sortStocks(items, sortField, sortDirection) : items;
        return displayItems.map((s: Stock, idx: number) => (
          <StockRow key={s.symbol ?? idx} stock={s} onClick={() => onRowClick?.(s.symbol ?? '')} inWatchlist={watchlistSymbols?.has(s.symbol ?? '') ?? false} onToggleWatchlist={onToggleWatchlist} isPending={pendingSymbol === s.symbol} />
        ));
      })()}
    </div>
  );
}