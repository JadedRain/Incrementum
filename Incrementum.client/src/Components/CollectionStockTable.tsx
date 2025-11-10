import React from 'react';
import Loading from './Loading';
import CollectionStockRow from './CollectionStockRow';

interface CollectionStockTableProps {
  stocksData: any[];
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
    <div className="flex-1" style={{ height: '100%' }}>
      <div className="StockTable-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '5px 5px 5px #3F3A30' }}>
        <div className="StockTable-header-row" style={{ flexShrink: 0 }}>
          <div className="StockTable-header">Symbol</div>
          <div className="StockTable-header">Price</div>
          <div className="StockTable-header">52W High</div>
          <div className="StockTable-header">52W Low</div>
          <div className="StockTable-header">1 Day % Chg.</div>
          <div className="StockTable-header">Vol.</div>
          <div className="StockTable-header">Mkt. Cap</div>
          <div className="StockTable-header">Remove</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
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
    </div>
  );
};

export default CollectionStockTable;
