import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { addToWatchlist, removeFromWatchlist } from '../utils/watchlistActions';
import { useFetchStocks } from '../useFetchStocks';
import { useFetchWatchlist } from '../useFetchWatchlist';
import Toast from '../Components/Toast';

interface StockInfo {
  [key: string]: any;
    displayName?: string;
    longName?: string;
    shortName?: string;
    symbol?: string;
    
}

const StockInfoList: React.FC = () => {
    const { apiKey } = useAuth();
    const { stocks, loading } = useFetchStocks();
    const { watchlistSymbols, setWatchlistSymbols } = useFetchWatchlist(apiKey);
    const [toast, setToast] = useState<string | null>(null);
    const [pending, setPending] = useState<null | string>(null);

    const handleAddToWatchlist = async (symbol?: string) => {
        if (!symbol) return;
        if (pending) return;
        await addToWatchlist(symbol, apiKey, setPending, setToast, undefined, setWatchlistSymbols);
    };

    const handleRemoveFromWatchlist = async (symbol?: string) => {
        if (!symbol) return;
        if (pending) return;
        await removeFromWatchlist(symbol, apiKey, setPending, setToast, undefined, setWatchlistSymbols);
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
            <Toast message={toast} />
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
}

export default StockInfoList;