import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { fetchWrapper } from '../Context/FetchingHelper';
import { useColumnVisibility } from '../Context/useColumnVisibility';
import StockColumn, { StockRowContext } from './StockColumn';

type Stock = {
  symbol?: string | null;
  regularMarketChangePercent?: number | null;
  currentPrice?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  marketCap?: number | null;
  volume?: number | null;
  averageVolume?: number | null;
  purchasePrice?: string | number | null;
};

type Props = {
  stock: Stock;
  onClick?: () => void;
  onRemove?: (symbol: string) => void;
  isPending?: boolean;
  collectionId?: string | undefined;
  collectionName?: string | undefined;
};

export default function CollectionStockRow({ stock, onClick, onRemove, isPending = false, collectionId, collectionName }: Props) {
  const { visibleColumns, columnOrder } = useColumnVisibility();
  const { apiKey } = useAuth();
  const symbol = (stock.symbol || 'N/A').toUpperCase();
  const fiftyTwoWeekHigh = stock.fiftyTwoWeekHigh as number | undefined;
  const fiftyTwoWeekLow = stock.fiftyTwoWeekLow as number | undefined;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPending && onRemove && stock.symbol) {
      onRemove(stock.symbol);
    }
  };

  const storageKey = `collection.purchasePrices.v1:${collectionId ?? 'global'}`;
  const [purchasePrice, setPurchasePrice] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    try {
      const serverVal = stock.purchasePrice;
      if (serverVal !== undefined && serverVal !== null) {
        setPurchasePrice(String(serverVal));
        return;
      }
      const raw = localStorage.getItem(storageKey);
      if (!raw) { setPurchasePrice(undefined); return; }
      const parsed = JSON.parse(raw || '{}');
      const val = parsed?.[symbol];
      setPurchasePrice(val === undefined ? undefined : String(val));
    } catch { setPurchasePrice(undefined); }
  }, [symbol, storageKey, stock]);

  const savePurchasePrice = (val: string) => {
    const saveLocally = () => {
        const raw = localStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : {};
        if (!val || val.trim() === '') {
          delete parsed[symbol];
          setPurchasePrice(undefined);
        } else {
          parsed[symbol] = val;
          setPurchasePrice(String(val));
        }
        localStorage.setItem(storageKey, JSON.stringify(parsed));
    };

    if (apiKey && collectionName) {
      (async () => {
        try {
          const body = { collection: collectionName, symbol, price: val };
          const res = await fetchWrapper(() => fetch('/custom-collection/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-User-Id': apiKey },
            body: JSON.stringify(body)
          }));
          if (!res.ok) {
            // fallback to local save
            saveLocally();
          } else {
            setPurchasePrice(val && val.trim() !== '' ? String(val) : undefined);
          }
        } catch {
          saveLocally();
        }
      })();
    } else {
      saveLocally();
    }
  };

  return (
    <StockRowContext.Provider value={stock}>
      <div className="StockTable-row" onClick={onClick}>
        {columnOrder.map((k) => {
        if (!visibleColumns[k]) return null;
        switch (k) {
          case 'symbol':
            return <StockColumn key={k} variableName="symbol" displayName="Symbol" />;
          case 'price':
            return <StockColumn key={k} variableName="regularMarketPrice" displayName="Price" />;
          case 'purchasePrice': {
            const formatted = purchasePrice ? (Number.isFinite(Number(purchasePrice)) ? `$${Number(purchasePrice).toFixed(2)}` : String(purchasePrice)) : '--';
            return (
              <div key={k} className="StockTable-cell">
                {editing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => { savePurchasePrice(editValue); setEditing(false); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { savePurchasePrice(editValue); setEditing(false); }
                      if (e.key === 'Escape') { setEditValue(purchasePrice ?? ''); setEditing(false); }
                    }}
                    className="w-full bg-white text-black p-1 rounded"
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div onClick={(e) => { e.stopPropagation(); setEditValue(purchasePrice ?? ''); setEditing(true); }} className="cursor-text">
                    {formatted}
                  </div>
                )}
              </div>
            );
          }
          case 'high52':
            return <div key={k} className="StockTable-cell text-sm">{fiftyTwoWeekHigh != null ? `$${fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}</div>;
          case 'low52':
            return <div key={k} className="StockTable-cell text-sm">{fiftyTwoWeekLow != null ? `$${fiftyTwoWeekLow.toFixed(2)}` : 'N/A'}</div>;
          case 'percentChange': {
            const percent = stock.regularMarketChangePercent as number | undefined;
            const pctText = percent == null || Number.isNaN(percent)
              ? 'N/A'
              : (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`);
            const pctClass = percent == null || Number.isNaN(percent) ? '' : (percent >= 0 ? 'text-green-500' : 'text-red-500');
            return <div key={k} className={`StockTable-cell ${pctClass}`}>{pctText}</div>;
          }
          case 'volume':
            return <StockColumn key={k} variableName="volume" displayName="Vol." />;
          case 'marketCap':
            return <StockColumn key={k} variableName="marketCap" displayName="Mkt. Cap" />;
          default:
            return null;
        }
        })}
      </div>
    </StockRowContext.Provider>
  );
}
