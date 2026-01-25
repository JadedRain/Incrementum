import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';

export function useBulkStockData(tickers: string[]) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { apiKey } = useAuth();
    useEffect(() => {
        if (!tickers || tickers.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        fetch('/stocks/bulk/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'X-User-Id': apiKey } : {})
            },
            body: JSON.stringify({ tickers })
        })
            .then(res => res.json())
            .then(json => {
                if (json.stocks) {
                    setData(json.stocks);
                } else {
                    setError(json.error || 'Unknown error');
                }
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [tickers, apiKey]);

    return { data, loading, error };
}
