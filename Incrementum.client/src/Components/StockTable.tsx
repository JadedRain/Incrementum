import { useState, useEffect } from 'react';
import Loading from './Loading';
import StockRow from './StockRow';
import ColumnVisibilityProvider from '../Context/ColumnVisibilityContext';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import '../styles/stock-table-extras.css';
import '../styles/PaginationControls.css';
import { useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';

type Stock = {
  symbol?: string;
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  market_cap?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  averageVolume?: number;
  volume?: number;
  eps?: number;
};

type ColKey = 'symbol' | 'price' | 'high52' | 'low52' | 'percentChange' | 'volume' | 'market_cap' | 'eps';
type Col = { k: ColKey; l: string };

type Props = { onRowClick?: (s: string) => void; stocks?: Stock[] };

export default function StockTable({ onRowClick, stocks: overrideStocks }: Props) {
  const { stocks: contextStocks, isLoading, sortBy, setSortBy, sortAsc, setSortAsc } = useDatabaseScreenerContext();
  const stocks = overrideStocks ?? contextStocks;

  const cols: Col[] = [
    { k: 'symbol', l: 'Symbol' },
    { k: 'price', l: 'Price' },
    { k: 'eps', l: 'EPS' },
    { k: 'high52', l: '52W High' },
    { k: 'low52', l: '52W Low' },
    { k: 'percentChange', l: '1 Day % Chg.' },
    { k: 'volume', l: 'Vol.' },
    { k: 'market_cap', l: 'Mkt. Cap' },
  ];

  return (
    <ColumnVisibilityProvider>
      <InnerStockTable onRowClick={onRowClick} cols={cols} stocks={stocks} isLoading={isLoading} sortBy={sortBy} setSortBy={setSortBy} sortAsc={sortAsc} setSortAsc={setSortAsc} />
    </ColumnVisibilityProvider>
  );
}

function InnerStockTable({ onRowClick, cols, stocks, isLoading, sortBy, setSortBy, sortAsc, setSortAsc }: {
  onRowClick?: (s: string) => void;
  cols: Col[];
  stocks: Stock[] | unknown;
  isLoading: boolean;
  sortBy: string | null;
  setSortBy: (v: string | null) => void;
  sortAsc: boolean;
  setSortAsc: (v: boolean) => void;
}) {
  const { visibleColumns, toggleColumn, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn } = useColumnVisibility();
  
  // Pagination
  const pageSize = 12;
  const stocksArray = Array.isArray(stocks) ? (stocks as Stock[]) : [];
  const totalPages = Math.ceil(stocksArray.length / pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedStocks = stocksArray.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset to page 1 when stock count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [stocksArray.length]);

  // Map column keys to backend sort fields
  const colToSortField = (k: string): string | null => {
    switch (k) {
      case 'symbol':
        return 'symbol';
      case 'price':
        return 'regularMarketPrice';
      case 'eps':
        return 'eps';
      case 'percentChange':
        return 'regularMarketChangePercent';
      case 'volume':
        return 'volume';
      case 'market_cap':
        return 'market_cap';
      case 'high52':
        return 'fiftyTwoWeekHigh';
      case 'low52':
        return 'fiftyTwoWeekLow';
      default:
        return null;
    }
  };

  const getSortIndicator = (field: string) => {
    if (sortBy !== field) return '';
    if (sortAsc) return ' ▲';
    return ' ▼';
  };

  const handleHeaderClick = (field: string) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
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
              {cols.filter(c => c.k !== 'symbol').map((c: Col) => (
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
          if (!visibleColumns[k]) return null;
          const sortableField = colToSortField(k);
          return (
            <div
              key={k}
              className="StockTable-header cursor-grab"
              draggable={true}
              data-index={idx}
              onDragStart={(e) => {
                e.dataTransfer?.setData('text/plain', String(idx));
                e.dataTransfer!.effectAllowed = 'move';
              }}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                const from = Number(e.dataTransfer?.getData('text/plain'));
                const to = idx;
                if (!Number.isNaN(from) && from !== to) moveColumn(from, to);
              }}
              onClick={() => { if (sortableField) handleHeaderClick(sortableField); }}
              role={sortableField ? 'button' : undefined}
              style={{ cursor: sortableField ? 'pointer' : 'grab' }}
            >
              {(labelMap[k] ?? k) + (sortableField ? getSortIndicator(sortableField) : '')}
            </div>
          );
        })}
      </div>
      <Loading loading={isLoading} />
      {stocksArray.length === 0 && <div>Select some filters to get started!</div>}
      {!isLoading && paginatedStocks.map((s: Stock, idx: number) => (
        <StockRow key={s.symbol ?? idx} stock={s} onClick={() => onRowClick?.(s.symbol ?? '')} />
      ))}
      {stocksArray.length > 0 && (
        <div className="pagination-controls">
          <button className="pagination-button pagination-options" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          <span className='pagination-options'>Page {currentPage} of {totalPages}</span>
          <button className="pagination-button pagination-options" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}