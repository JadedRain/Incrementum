import React from 'react';
import { useColumnVisibility } from '../Context/useColumnVisibility';

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

type Props = {
  stock: Stock;
  onClick?: () => void;
  inWatchlist?: boolean;
  onToggleWatchlist?: (s: string, inW: boolean) => void;
  isPending?: boolean;
};

const fmt = (v?: number) => {
  if (v == null || Number.isNaN(v)) return 'N/A';
  const abs = Math.abs(v);
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(2)}K`;
  return v.toString();
};

export default function StockRow({ stock, onClick, inWatchlist = false, onToggleWatchlist, isPending = false }: Props) {
  const { visibleColumns, columnOrder } = useColumnVisibility();
  const s = stock;
  const symbol = (s.symbol || 'N/A').toUpperCase();
  const o = {
    price: s.regularMarketPrice,
    high52: s.fiftyTwoWeekHigh,
    low52: s.fiftyTwoWeekLow,
    percentChange: s.regularMarketChangePercent,
    volume: s.regularMarketVolume ?? s.averageDailyVolume3Month ?? s.averageVolume ?? s.volume,
    marketCap: s.marketCap,
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
          case 'high52':
            return <Cell key={k}>{o.high52 != null ? `$${o.high52.toFixed(2)}` : 'N/A'}</Cell>;
          case 'low52':
            return <Cell key={k}>{o.low52 != null ? `$${o.low52.toFixed(2)}` : 'N/A'}</Cell>;
          case 'percentChange':
            return <Cell key={k}><span className={o.percentChange != null && o.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>{o.percentChange != null ? (o.percentChange >= 0 ? `+${o.percentChange.toFixed(2)}%` : `${o.percentChange.toFixed(2)}%`) : 'N/A'}</span></Cell>;
          case 'volume':
            return <Cell key={k}>{fmt(o.volume)}</Cell>;
          case 'marketCap':
            return <Cell key={k}>{fmt(o.marketCap)}</Cell>;
          case 'watchlist':
            return onToggleWatchlist ? (
              <div key={k} className="StockTable-cell">
                <button aria-label={inWatchlist ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`} onClick={(e) => { e.stopPropagation(); if (!isPending && onToggleWatchlist && s.symbol) onToggleWatchlist(s.symbol, inWatchlist); }} className={`watch-btn ${isPending ? 'opacity-50' : 'opacity-100'}`} disabled={isPending}>{inWatchlist ? '−' : '+'}</button>
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}