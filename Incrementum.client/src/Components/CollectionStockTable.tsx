import { useState } from 'react';
import Loading from './Loading';
import CollectionStockRow from './CollectionStockRow';
import StockColumn, { StockTableContext } from './StockColumn';
import { getNextSortDirection, type SortDirection, type SortField, sortStocks } from '../utils/sortingUtils';
import type { StockInfo } from '../Types/StockInfoTypes';
import Stock from '../Pages/Stock';

interface Stock {
  symbol: string;
  [key: string]: unknown;
}

interface CollectionStockTableProps {
  stocksData: Stock[];
  loadingStocks: boolean;
  tokens: string[];
  onStockClick: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
  pendingSymbol: string | null;
}
export default function CollectionStockTable({
  stocksData,
  loadingStocks,
  tokens,
  onStockClick,
  onRemoveStock,
  pendingSymbol
}: CollectionStockTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const isSortField = (c: string): c is SortField => {
    return ['name', 'price', 'percentChange', 'volume', 'marketCap'].includes(c);
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

  const tableSetSort = (col: string) => {
    if (col === 'regularMarketPrice') {
      handleHeaderClick('price');
    } else if (isSortField(col)) {
      handleHeaderClick(col);
    }
  };

  return (
    <StockTableContext.Provider value={{ sortBy: sortField, sortDir: sortDirection, setSort: tableSetSort }}>
      <div className="flex-1" style={{ height: '100%' }}>
        <div className="StockTable-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '5px 5px 5px #3F3A30' }}>
          <div className="StockTable-header-row" style={{ flexShrink: 0 }}>
            <StockColumn variableName="name" displayName={`Symbol${getSortIndicator('name')}`} />
            <StockColumn variableName="regularMarketPrice" displayName={`Price${getSortIndicator('price')}`} />
            <div className="StockTable-header">52W High</div>
            <div className="StockTable-header">52W Low</div>
            <StockColumn variableName="percentChange" displayName={`1 Day % Chg.${getSortIndicator('percentChange')}`} />
            <StockColumn variableName="volume" displayName={`Vol.${getSortIndicator('volume')}`} />
            <StockColumn variableName="marketCap" displayName={`Mkt. Cap${getSortIndicator('marketCap')}`} />
            <div className="StockTable-header">Remove</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingStocks && !(sortField && sortDirection) && <Loading loading={true} />}
            {!loadingStocks && tokens.length === 0 && (
              <div className="StockTable-row">
                <div className="StockTable-cell text-gray-500 col-span-6">No stocks in collection.</div>
              </div>
            )}
            {!loadingStocks && (() => {
              const displayStocks: StockInfo[] = (sortField && sortDirection)
                ? sortStocks(stocksData as unknown as StockInfo[], sortField, sortDirection)
                : (stocksData as unknown as StockInfo[]);
              return displayStocks.map((stock) => (
              <CollectionStockRow
                key={stock.symbol}
                stock={stock}
                onClick={() => onStockClick(stock.symbol ?? '')}
                onRemove={onRemoveStock}
                isPending={pendingSymbol === stock.symbol}
              />
              ));
            })()}
          </div>
        </div>
      </div>
    </StockTableContext.Provider>
  );
}