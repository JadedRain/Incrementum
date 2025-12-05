import { useState, useEffect } from 'react';
import Loading from './Loading';
import CollectionStockRow from './CollectionStockRow';
import ColumnVisibilityProvider from '../Context/ColumnVisibilityContext';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import { sortStocks, type SortField, type SortDirection } from '../utils/sortingUtils';
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
  collectionId?: string | undefined;
  collectionName?: string | undefined;
}
export default function CollectionStockTable({
  stocksData,
  loadingStocks,
  tokens,
  onStockClick,
  onRemoveStock,
  pendingSymbol
  , collectionId, collectionName
}: CollectionStockTableProps) {

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
          collectionId={collectionId}
          collectionName={collectionName}
        />
      </ColumnVisibilityProvider>
    </div>
  );
};

function InnerCollectionStockTable({ stocksData, loadingStocks, tokens, onStockClick, onRemoveStock, pendingSymbol, collectionId, collectionName }: CollectionStockTableProps) {
  const { visibleColumns, toggleColumn, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn } = useColumnVisibility();
  // Debug: log visibility/order to help diagnose missing column
  console.debug('CollectionStockTable visibleColumns:', visibleColumns, 'columnOrder:', columnOrder);

  const cols = [
    { k: 'symbol', l: 'Symbol' },
    { k: 'price', l: 'Price' },
    { k: 'purchasePrice', l: 'Buy Price' },
    { k: 'high52', l: '52W High' },
    { k: 'low52', l: '52W Low' },
    { k: 'percentChange', l: '1 Day % Chg.' },
    { k: 'volume', l: 'Vol.' },
    { k: 'marketCap', l: 'Mkt. Cap' },
  ];

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price', label: 'Current Price' },
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'recentlyViewed', label: 'Recently Viewed' },
  ];

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSortField(null);
      setSortDirection(null);
    } else {
      const newField = value as SortField;
      if (sortField === newField) {
        return;
      }
      setSortField(newField);
      setSortDirection(newField === 'name' ? 'asc' : 'desc');
    }
  };

  const toggleSortDirection = () => {
    if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortDirection('asc');
    }
  };

  const handleStockClick = (symbol: string) => {
    try {
      const storageKey = `collection.lastViewed.v1:${collectionId ?? 'global'}`;
      const now = Date.now();
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[symbol] = now;
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to track view:', e);
    }
    onStockClick(symbol);
  };

  useEffect(() => {
    const enrichedStocksKey = `collection.enriched.${collectionId}`;
      const viewStorageKey = `collection.lastViewed.v1:${collectionId ?? 'global'}`;
      const viewRaw = localStorage.getItem(viewStorageKey);
      const viewData = viewRaw ? JSON.parse(viewRaw) : {};
      
      const dateAddedKey = `collection.dateAdded.v1:${collectionId ?? 'global'}`;
      const dateAddedRaw = localStorage.getItem(dateAddedKey);
      const dateAddedData = dateAddedRaw ? JSON.parse(dateAddedRaw) : {};
      
      let updated = false;
      const baseTime = Date.now();
      tokens.forEach((symbol, index) => {
        if (!dateAddedData[symbol]) {
          dateAddedData[symbol] = baseTime + (index * 1000);
          updated = true;
        }
      });
      
      if (updated) {
        localStorage.setItem(dateAddedKey, JSON.stringify(dateAddedData));
      }
      
      const enrichmentData = { viewData, dateAddedData };
      sessionStorage.setItem(enrichedStocksKey, JSON.stringify(enrichmentData));
      
  }, [tokens, collectionId]);

  return (
    <div className="StockTable-container stocktable-flex">
      <div className="mb-3 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#3f2a10]">Sort by:</label>
          <select
            value={sortField ?? ''}
            onChange={handleSortChange}
            className="px-3 py-1.5 text-sm border border-[#3f2a10] rounded bg-[hsl(40,63%,63%)] text-[#3f2a10] cursor-pointer hover:bg-[hsl(40,63%,58%)] focus:outline-none focus:ring-2 focus:ring-[#3f2a10]"
            aria-label="Sort by"
          >
            <option value="">Default Order</option>
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {sortField && sortDirection && (
            <button
              onClick={toggleSortDirection}
              className="px-2 py-1.5 text-sm border border-[#3f2a10] rounded bg-[hsl(40,63%,63%)] text-[#3f2a10] cursor-pointer hover:bg-[hsl(40,63%,58%)] focus:outline-none focus:ring-2 focus:ring-[#3f2a10] font-bold"
              aria-label="Toggle sort direction"
              title={sortDirection === 'asc' ? 'Ascending (click for descending)' : 'Descending (click for ascending)'}
            >
              {sortDirection === 'asc' ? '▲' : '▼'}
            </button>
          )}
        </div>
        <div className="relative">
          <button ref={btnRef} aria-label="Columns" onClick={() => setMenuOpen(!menuOpen)} className="kebab-btn"><span className="kebab-icon">⋮</span></button>
          {menuOpen && (
            <div ref={menuRef} className="kebab-menu" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
      </div>
      <div className="StockTable-header-row stocktable-header-row-relative">

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
              style={{ cursor: draggable ? 'grab' : 'default' }}
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
        {!loadingStocks && (() => {
          // Enrich stocks with dateAdded and lastViewed
          const enrichedStocksKey = `collection.enriched.${collectionId}`;
          let enrichedData: { viewData: Record<string, number>; dateAddedData: Record<string, number> } = { viewData: {}, dateAddedData: {} };
          try {
            const raw = sessionStorage.getItem(enrichedStocksKey);
            if (raw) enrichedData = JSON.parse(raw);
          } catch (e) {
            console.warn('Failed to load enrichment data:', e);
          }
          
          const enrichedStocks = stocksData.map(stock => {
            const enriched = {
              ...stock,
              lastViewed: enrichedData.viewData[stock.symbol] || 0,
              dateAdded: enrichedData.dateAddedData[stock.symbol] || 0,
            };
            if (stocksData.indexOf(stock) < 3) {
              console.debug(`Stock ${stock.symbol}:`, {
                purchasePrice: stock.purchasePrice,
                lastViewed: enriched.lastViewed,
                dateAdded: enriched.dateAdded
              });
            }
            return enriched;
          });
          
          const displayStocks = (sortField && sortDirection) 
            ? sortStocks(enrichedStocks as unknown as Stock[], sortField, sortDirection) 
            : enrichedStocks;
            
          return displayStocks.map((stock) => (
           <CollectionStockRow
             key={stock.symbol}
             stock={stock}
             onClick={() => handleStockClick(stock.symbol ?? '')}
            onRemove={onRemoveStock}
            isPending={pendingSymbol === stock.symbol}
            collectionId={collectionId}
            collectionName={collectionName}
          />
          ));
        })()}
      </div>
    </div>
  );
}