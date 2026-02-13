import React from 'react';
import { useColumnVisibility } from '../Context/useColumnVisibility';

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

type Props = {
  stock: Stock;
  onClick?: () => void;
};

const fmt = (v?: number) => {
  if (v == null || Number.isNaN(v)) return 'N/A';
  const abs = Math.abs(v);
  if (abs >= 1e12) return `$${(v / 1e12).toFixed(2)} T`
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(2)} B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(2)} M`;
  if (abs >= 1e3) return `$${(v / 1e3).toFixed(2)} K`;
  return v.toString();
};

export default function StockRow({ stock, onClick }: Props) {
  const { visibleColumns, columnOrder } = useColumnVisibility();
  const s = stock;
  const symbol = (s.symbol || 'N/A').toUpperCase();
  const o = {
    price: s.regularMarketPrice,
    high52: s.fiftyTwoWeekHigh,
    low52: s.fiftyTwoWeekLow,
    percentChange: s.regularMarketChangePercent,
    volume: s.regularMarketVolume ?? s.averageDailyVolume3Month ?? s.averageVolume ?? s.volume,
    market_cap: s.market_cap,
    eps: s.eps,
  } as Record<string, number | undefined>;
  const Cell = ({ children }: { children: React.ReactNode }) => (
    <div className="StockTable-cell">{children}</div>
  );

  return (
    <div className="StockTable-row" onClick={onClick}>
      {columnOrder.map((k) => {
        if (!visibleColumns[k]) return null;
        switch (k) {
          case 'symbol':
            return <div key={k} className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>;
          case 'price':
            return <Cell key={k}>{o.price != null ? `$${o.price.toFixed(2)}` : 'N/A'}</Cell>;
          case 'eps':
            return <Cell key={k}>{o.eps != null ? `$${o.eps.toFixed(2)}` : 'N/A'}</Cell>;
          case 'high52':
            return <Cell key={k}>{o.high52 != null ? `$${o.high52.toFixed(2)}` : 'N/A'}</Cell>;
          case 'low52':
            return <Cell key={k}>{o.low52 != null ? `$${o.low52.toFixed(2)}` : 'N/A'}</Cell>;
          case 'percentChange':
            return <Cell key={k}><span className={o.percentChange != null && o.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>{o.percentChange != null ? (o.percentChange >= 0 ? `+${o.percentChange.toFixed(2)}%` : `${o.percentChange.toFixed(2)}%`) : 'N/A'}</span></Cell>;
          case 'volume':
            return <Cell key={k}>{fmt(o.volume)}</Cell>;
          case 'market_cap':
            return <Cell key={k}>{fmt(o.market_cap)}</Cell>;
          default:
            return null;
        }
      })}
    </div>
  );
}