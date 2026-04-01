import Loading from './Loading';
import StockRow from './StockRow';
import ColumnVisibilityProvider from '../Context/ColumnVisibilityContext';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import '../styles/stock-table-extras.css';
import '../styles/PaginationControls.css';
import { useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';
import { useState } from 'react';
import InfoIconSvg from '../assets/info-filled-svgrepo-com.svg';

const columnDescriptions: Record<string, string> = {
  eps: 'Earnings per share. Net income divided by average weighted outstanding shares. Higher typically means better return for investors.',
  debt_to_equity: 'Debt to equity ratio. Liability divided by shareholders equity. Lower indicates stability, higher indicates volatility.',
  high52: 'The highest stock price over the last 52 weeks. Can indicate if stock was overvalued or currently at a low point.',
  low52: 'The lowest stock price over the last 52 weeks. Can be used to indicate growth potential.',
  percentChange: 'The percentage change in stock price over 1 day. Red for losses, green for gains.',
  volume: 'Current trading volume. Measure of all trades in a specific period. Indicates if a stock is actively traded.',
  market_cap: 'Market capitalization. Total valuation of outstanding shares. Indicates potential gains in large scale trades.',
  outstanding_shares: 'The amount of shares held by shareholders. Used as a component in other metrics.',
  share_class_figi: 'Different classifications of shares (Class A, Class B, etc.). Class A is typically higher priority.',
  sic_description: 'The industry sector or classification of the company.',
  annual_eps_growth_rate: 'The percentage change in earnings per share over the last year. Indicates earnings growth.',
  price_per_earnings: 'Price to earnings ratio. Stock price divided by EPS. Higher ratio indicates higher expected growth.',
  pe_per_growth: '(Price per Share / EPS) divided by Expected Earnings Growth Rate. Compares valuation to growth.',
  revenue_per_share: 'Total revenue divided by outstanding shares. Used to identify undervalued stocks.',
  price_per_sales: 'Price to sales ratio. Stock price divided by revenue per share. Useful for identifying undervalued stocks.',
};

function InfoIcon({ description, position = 'left' }: { description?: string; position?: 'left' | 'right' | 'bottom' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!description) {
    return null;
  }

  const tooltipClasses = position === 'left'
    ? 'absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-2 bg-gray-900 text-white rounded text-xs whitespace-normal w-48 shadow-lg z-50'
    : position === 'right'
    ? 'absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white rounded text-xs whitespace-normal w-48 shadow-lg z-50'
    : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white rounded text-xs whitespace-normal w-48 shadow-lg z-50';
  
  const arrowClasses = position === 'left'
    ? 'absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900'
    : position === 'right'
    ? 'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900'
    : 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900';

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <img src={InfoIconSvg} alt="info" className="w-5 h-5 cursor-help inline-block ml-2" />
      {showTooltip && (
        <div className={tooltipClasses}>
          {description}
          <div className={arrowClasses}></div>
        </div>
      )}
    </div>
  );
}

type Stock = {
  symbol?: string;
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  price?: number;
  dayPercentChange?: number;
  market_cap?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  averageVolume?: number;
  volume?: number;
  eps?: number;
  debt_to_equity?: number;
  list_date?: string | null;
  outstanding_shares?: number | null;
  share_class_figi?: string | null;
  sic_description?: string | null;
  annual_eps_growth_rate?: number | null;
  price_per_earnings?: number | null;
  pe_per_growth?: number | null;
  revenue_per_share?: number | null;
  price_per_sales?: number | null;
};

type ColKey = 'symbol' | 'price' | 'high52' | 'low52' | 'percentChange' | 'volume' | 'market_cap' | 'eps' | 'debt_to_equity' | 'list_date' | 'outstanding_shares' | 'share_class_figi' | 'sic_description' | 'annual_eps_growth_rate' | 'price_per_earnings' | 'pe_per_growth' | 'revenue_per_share' | 'price_per_sales';
type Col = { k: ColKey; l: string };

type Props = { onRowClick?: (s: string) => void; stocks?: unknown[] };

export default function StockTable({ onRowClick, stocks: overrideStocks }: Props) {
  const {
    stocks: contextStocks,
    isLoading,
    sortBy,
    setSortBy,
    sortAsc,
    setSortAsc,
    page,
    setPage,
    pagination,
  } = useDatabaseScreenerContext();
  const stocks = (overrideStocks ?? contextStocks) as unknown[];
  const useBackendPagination = overrideStocks === undefined;

  const cols: Col[] = [
    { k: 'symbol', l: 'Symbol' },
    { k: 'price', l: 'Price' },
    { k: 'eps', l: 'EPS' },
    { k: 'debt_to_equity', l: 'D/E Ratio' },
    { k: 'high52', l: '52W High' },
    { k: 'low52', l: '52W Low' },
    { k: 'percentChange', l: '1 Day % Chg.' },
    { k: 'volume', l: 'Vol.' },
    { k: 'market_cap', l: 'Mkt. Cap' },
    { k: 'list_date', l: 'Listed Date' },
    { k: 'outstanding_shares', l: 'Outstanding Shares' },
    { k: 'share_class_figi', l: 'Share Class' },
    { k: 'sic_description', l: 'Industry' },
    { k: 'annual_eps_growth_rate', l: 'Annual EPS Growth' },
    { k: 'price_per_earnings', l: 'P/E Ratio' },
    { k: 'pe_per_growth', l: 'PEG Ratio' },
    { k: 'revenue_per_share', l: 'Revenue/Share' },
    { k: 'price_per_sales', l: 'P/S Ratio' },
  ];

  return (
    <ColumnVisibilityProvider>
      <InnerStockTable
        onRowClick={onRowClick}
        cols={cols}
        stocks={stocks}
        isLoading={isLoading}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortAsc={sortAsc}
        setSortAsc={setSortAsc}
        page={page}
        setPage={setPage}
        pagination={pagination}
        useBackendPagination={useBackendPagination}
      />
    </ColumnVisibilityProvider>
  );
}

function InnerStockTable({
  onRowClick,
  cols,
  stocks,
  isLoading,
  sortBy,
  setSortBy,
  sortAsc,
  setSortAsc,
  page,
  setPage,
  pagination,
  useBackendPagination,
}: {
  onRowClick?: (s: string) => void;
  cols: Col[];
  stocks: unknown;
  isLoading: boolean;
  sortBy: string | null;
  setSortBy: (v: string | null) => void;
  sortAsc: boolean;
  setSortAsc: (v: boolean) => void;
  page: number;
  setPage: (v: number) => void;
  pagination: {
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  useBackendPagination: boolean;
}) {
  const { visibleColumns, toggleColumn, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn } = useColumnVisibility();
  const stocksArray = Array.isArray(stocks) ? (stocks as Stock[]) : [];

  // Map column keys to backend sort fields
  const colToSortField = (k: string): string | null => {
    switch (k) {
      case 'symbol':
        return 'symbol';
      case 'price':
        return 'price';
      case 'eps':
        return 'eps';
      case 'debt_to_equity':
        return 'debt_to_equity';
      case 'percentChange':
        return 'percent_change';
      case 'volume':
        return 'volume';
      case 'market_cap':
        return 'market_cap';
      case 'high52':
        return 'high52';
      case 'low52':
        return 'low52';
      case 'list_date':
        return 'list_date';
      case 'outstanding_shares':
        return 'outstanding_shares';
      case 'share_class_figi':
        return 'share_class_figi';
      case 'sic_description':
        return 'sic_description';
      case 'annual_eps_growth_rate':
        return 'annual_eps_growth_rate';
      case 'price_per_earnings':
        return 'price_per_earnings';
      case 'pe_per_growth':
        return 'pe_per_growth';
      case 'revenue_per_share':
        return 'revenue_per_share';
      case 'price_per_sales':
        return 'price_per_sales';
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
  const menuStyle = 'absolute right-0 mt-1 bg-[var(--bg-surface)] rounded-lg shadow-lg p-3 min-w-[240px]';

  return (
    <div className="StockTable-container stocktable-flex">
      <div className="StockTable-header-row relative">
        <div className="absolute right-2 top-1 z-10">
          <button ref={btnRef} aria-label="Columns" onClick={() => setMenuOpen(!menuOpen)} className={btnStyle}><span className="text-[20px]">⋮</span></button>
          {menuOpen && (
            <div ref={menuRef} className={menuStyle}>
              <div className="font-bold mb-2 text-[15px] text-[var(--text-primary)]">Columns</div>
              {cols.filter(c => c.k !== 'symbol').map((c: Col) => (
                <label key={c.k} className="flex items-center gap-3 mb-2">
                  <input className="transform scale-125 accent-[#6b4c1b]" type="checkbox" checked={!!visibleColumns[c.k]} onChange={() => toggleColumn(c.k)} />
                  <div className="flex items-center">
                    <span className="text-[15px] text-[var(--text-primary)]">{c.l}</span>
                    <InfoIcon description={columnDescriptions[c.k as ColKey]} position="left" />
                  </div>
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
              className={`StockTable-header ${sortableField ? 'col-sortable' : 'col-draggable'}`}
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
            >
              <div className="flex items-center justify-center">
                <span>{(labelMap[k] ?? k) + (sortableField ? getSortIndicator(sortableField) : '')}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="stocktable-body">
        <Loading loading={isLoading} />
        {!isLoading && stocksArray.map((s: Stock, idx: number) => (
          <StockRow key={s.symbol ?? idx} stock={s} onClick={() => onRowClick?.(s.symbol ?? '')} />
        ))}
      </div>
      {useBackendPagination && pagination && pagination.total_pages > 0 && (
        <div className="pagination-controls">
          <button
            className="pagination-button pagination-options"
            onClick={() => setPage(page - 1)}
            disabled={!pagination.has_prev || isLoading}
          >
            Prev
          </button>
          <span className='pagination-options'>Page {page} of {pagination.total_pages}</span>
          <button
            className="pagination-button pagination-options"
            onClick={() => setPage(page + 1)}
            disabled={!pagination.has_next || isLoading}
          >
            Next
          </button>
        </div>
      )}
      {useBackendPagination && pagination && (
        <div className="results-count">
          <span className="results-count-number">{pagination.total_count.toLocaleString()}</span>
          {' '}{pagination.total_count === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  );
}