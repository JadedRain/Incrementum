import React from 'react';
import { useColumnVisibility } from '../Context/useColumnVisibility';

type Stock = {
  symbol?: string;
  regularMarketChangePercent?: number;
  regularMarketPrice?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  high52?: number;
  low52?: number;
  price?: number;
  dayPercentChange?: number;
  market_cap?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  averageVolume?: number;
  volume?: number;
  eps?: number;
  list_date?: string | null;
  outstanding_shares?: number | null;
  share_class_figi?: string | null;
  sic_description?: string | null;
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

const fmtCount = (v?: number | null) => {
  if (v == null || Number.isNaN(v)) return 'N/A';
  return new Intl.NumberFormat('en-US').format(v);
};

const fmtDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US');
};

export default function StockRow({ stock, onClick }: Props) {
  const { visibleColumns, columnOrder } = useColumnVisibility();
  const s = stock;
  const symbol = (s.symbol || 'N/A').toUpperCase();
  const o = {
    price: s.price ?? s.regularMarketPrice,
    high52: s.high52 ?? s.fiftyTwoWeekHigh,
    low52: s.low52 ?? s.fiftyTwoWeekLow,
    percentChange: s.dayPercentChange ?? s.regularMarketChangePercent,
    volume: s.regularMarketVolume ?? s.averageDailyVolume3Month ?? s.averageVolume ?? s.volume,
    market_cap: s.market_cap,
    eps: s.eps,
    list_date: s.list_date,
    outstanding_shares: s.outstanding_shares,
    share_class_figi: s.share_class_figi,
    sic_description: s.sic_description,
  } as Record<string, number | undefined>;
  const Cell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`StockTable-cell ${className}`.trim()}>{children}</div>
  );

  return (
    <div className="StockTable-row" onClick={onClick}>
      {columnOrder.map((k) => {
        if (!visibleColumns[k]) return null;
        switch (k) {
          case 'symbol':
            return <div key={k} className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>;
          case 'price':
            return <Cell key={k} className="StockTable-cell--numeric">{o.price != null ? `$${(o.price / 100).toFixed(2)}` : 'N/A'}</Cell>;
          case 'eps':
            return <Cell key={k} className="StockTable-cell--numeric">{o.eps != null ? `$${o.eps.toFixed(2)}` : 'N/A'}</Cell>;
          case 'high52':
            return <Cell key={k} className="StockTable-cell--numeric">{o.high52 != null ? `$${(o.high52 / 100).toFixed(2)}` : 'N/A'}</Cell>;
          case 'low52':
            return <Cell key={k} className="StockTable-cell--numeric">{o.low52 != null ? `$${(o.low52 / 100).toFixed(2)}` : 'N/A'}</Cell>;
          case 'percentChange':
            return <Cell key={k} className="StockTable-cell--numeric"><span className={o.percentChange != null && o.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>{o.percentChange != null ? (o.percentChange >= 0 ? `+${o.percentChange.toFixed(2)}%` : `${o.percentChange.toFixed(2)}%`) : 'N/A'}</span></Cell>;
          case 'volume':
            return <Cell key={k} className="StockTable-cell--numeric">{fmt(o.volume)}</Cell>;
          case 'market_cap':
            return <Cell key={k} className="StockTable-cell--numeric">{fmt(o.market_cap)}</Cell>;
          case 'list_date':
            return <Cell key={k} className="StockTable-cell--numeric">{fmtDate(s.list_date)}</Cell>;
          case 'outstanding_shares':
            return <Cell key={k} className="StockTable-cell--numeric">{fmtCount(s.outstanding_shares)}</Cell>;
          case 'share_class_figi':
            return <Cell key={k}>{s.share_class_figi || 'N/A'}</Cell>;
          case 'sic_description':
            return <Cell key={k}>{s.sic_description || 'N/A'}</Cell>;
          default:
            return null;
        }
      })}
    </div>
  );
}