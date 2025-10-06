import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';

interface StockInfo {
  [key: string]: any;
    displayName?: string;
    longName?: string;
    shortName?: string;
    symbol?: string;
    
}

const StockInfoList: React.FC = () => {
  const { apiKey } = useAuth();
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<null | string>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
  const response = await fetch('/getStockInfo/');
        const data = await response.json();
        setStocks(data.stocks.slice(0, 11));
        console.log(stocks.length);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const res = await fetch('/watchlist/', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const symbols = new Set<string>((data.watchlist || []).map((s: any) => s.symbol).filter((s: any) => typeof s === 'string'));
      setWatchlistSymbols(symbols);
    };
    fetchWatchlist();
  }, []);

  const getCSRFCookie = () => {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : undefined;
  };

  const handleAddToWatchlist = async (symbol?: string) => {
    if (!symbol) return;
    try {
      if (pending) return;
      setPending(symbol);
      const csrf = getCSRFCookie();
      const res = await fetch('/watchlist/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRFToken': csrf } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ symbol, user_id: apiKey }),
      });
      if (!res.ok) {
        const msg = await res.text();
        console.error('Failed to add to watchlist', msg);
        setToast(`Failed to add ${symbol}: ${msg || 'request error'}`);
        setTimeout(() => setToast(null), 2500);
        return;
      }
      await res.json();
      setWatchlistSymbols((prev) => new Set<string>([...prev, symbol]));
      setToast(`Successfully added ${symbol} to watchlist`);
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      console.error('Error adding to watchlist', e);
      setToast(`Failed to add ${symbol}: ${(e as Error).message}`);
      setTimeout(() => setToast(null), 2500);
    }
    finally {
      setPending(null);
    }
  };

  const handleRemoveFromWatchlist = async (symbol?: string) => {
    if (!symbol) return;
    try {
      if (pending) return;
      setPending(symbol);
      const csrf = getCSRFCookie();
      const res = await fetch('/watchlist/remove/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRFToken': csrf } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ symbol, user_id: apiKey }),
      });
      if (!res.ok) {
        const msg = await res.text();
        console.error('Failed to remove from watchlist', msg);
        setToast(`Failed to remove ${symbol}: ${msg || 'request error'}`);
        setTimeout(() => setToast(null), 2500);
        return;
      }
      await res.json();
      setWatchlistSymbols((prev) => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
      setToast(`Removed ${symbol} from watchlist`);
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      console.error('Error removing from watchlist', e);
      setToast(`Failed to remove ${symbol}: ${(e as Error).message}`);
      setTimeout(() => setToast(null), 2500);
    }
    finally {
      setPending(null);
    }
  };

  const handleToggleWatchlist = (symbol?: string) => {
    if (!symbol) return;
    if (watchlistSymbols.has(symbol)) {
      void handleRemoveFromWatchlist(symbol);
    } else {
      void handleAddToWatchlist(symbol);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '12px',
            right: '12px',
            background: '#2d2d2d',
            color: '#EBCB92',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
            zIndex: 2000,
          }}
        >
          {toast}
        </div>
      )}
      <h2>Stock Info</h2>
      <ul>
        {stocks.map((item, idx) => {
          const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
          const symbol = item.symbol as string | undefined;
          const inWatchlist = symbol ? watchlistSymbols.has(symbol) : false;
          return (
            <li className="stock-card" key={idx} style={{ marginBottom: '1rem' }}>
              <span className='p-1 newsreader-font'>{name} </span>
              {apiKey && (
                <button
                  className='add-to-watchlist-button'
                  onClick={() => handleToggleWatchlist(symbol)}
                  aria-label={`${inWatchlist ? 'Remove' : 'Add'} ${name} ${inWatchlist ? 'from' : 'to'} watchlist`}
                  disabled={pending === symbol}
                >
                  {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StockInfoList;
