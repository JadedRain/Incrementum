import React from 'react';
import Loading from './Loading';
import CollectionStockRow from './CollectionStockRow';
import ColumnVisibilityProvider from '../Context/ColumnVisibilityContext';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import '../styles/stock-table-extras.css';

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

const CollectionStockTable: React.FC<CollectionStockTableProps> = ({
  stocksData,
  loadingStocks,
  tokens,
  onStockClick,
  onRemoveStock,
  pendingSymbol
}) => {
  return (
    <div className="flex-1 h-full">
      <ColumnVisibilityProvider showWatchlist={true}>
        <InnerCollectionStockTable
          stocksData={stocksData}
          loadingStocks={loadingStocks}
          tokens={tokens}
          onStockClick={onStockClick}
          onRemoveStock={onRemoveStock}
          pendingSymbol={pendingSymbol}
        />
      </ColumnVisibilityProvider>
    </div>
  );
};

function InnerCollectionStockTable({ stocksData, loadingStocks, tokens, onStockClick, onRemoveStock, pendingSymbol }: CollectionStockTableProps) {
  const { visibleColumns, toggleColumn, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn } = useColumnVisibility();

  const cols = [
    { k: 'symbol', l: 'Symbol' },
    { k: 'price', l: 'Price' },
    { k: 'high52', l: '52W High' },
    { k: 'low52', l: '52W Low' },
    { k: 'percentChange', l: '1 Day % Chg.' },
    { k: 'volume', l: 'Vol.' },
    { k: 'marketCap', l: 'Mkt. Cap' },
  ];

  return (
    <div className="StockTable-container stocktable-flex">
      <div className="StockTable-header-row stocktable-header-row-relative">
        <div className="absolute right-2 top-1 z-10">
          <button ref={btnRef} aria-label="Columns" onClick={() => setMenuOpen(!menuOpen)} className="kebab-btn"><span className="kebab-icon">⋮</span></button>
          {menuOpen && (
            <div ref={menuRef} className="kebab-menu">
              <div className="kebab-title">Columns</div>
              {cols.filter(c => c.k !== 'symbol' && c.k !== 'watchlist').map((c) => (
                <label key={c.k} className="column-label">
                  <input className="column-checkbox" type="checkbox" checked={!!visibleColumns[c.k]} onChange={() => toggleColumn(c.k)} />
                  <span className="text-[15px] text-[#3f2a10]">{c.l}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {columnOrder.map((k, idx) => {
          const labelMap: Record<string, string> = Object.fromEntries(cols.map(c => [c.k, c.l]));
          labelMap.watchlist = 'Remove';
          if (!visibleColumns[k]) return null;
          const isRemove = k === 'watchlist';
          const draggable = !isRemove;
          return (
            <div
              key={k}
              className={`StockTable-header ${draggable ? 'header-draggable' : 'header-default'}`}
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
            >
              {labelMap[k] ?? k}
            </div>
          );
        })}
      </div>

      <div className="stocktable-scroll">
        {loadingStocks && <Loading loading={true} />}
        {!loadingStocks && tokens.length === 0 && (
          <div className="StockTable-row">
            <div className="StockTable-cell text-gray-500 col-span-6">No stocks in collection.</div>
          </div>
        )}
        {!loadingStocks && stocksData.map((stock) => (
          <CollectionStockRow
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick(stock.symbol)}
            onRemove={onRemoveStock}
            isPending={pendingSymbol === stock.symbol}
          />
        ))}
      </div>
    </div>
  );
}

export default CollectionStockTable;
