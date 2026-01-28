import { useState, useEffect } from 'react';
import { useCustomCollection } from './useCustomCollection';
import { useAuth } from '../Context/AuthContext';
import { apiString, fetchWrapper } from "../Context/FetchingHelper";
import type { StockInfo } from '../Types/StockInfoTypes';

export function useBulkStockDataForCollection(collectionId: number | null) {
    const { apiKey } = useAuth();
    const { tokens, refreshCollection, error: collectionError } = useCustomCollection({ id: collectionId, apiKey });
    const [data, setData] = useState<StockInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tokens || tokens.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        fetchWrapper(() => fetch(apiString('/stocks/bulk/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'X-User-Id': apiKey } : {})
            },
            body: JSON.stringify({ tickers: tokens })
        }))
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
    }, [tokens, apiKey]);

    const refresh = () => {
        if (refreshCollection) refreshCollection();
    };

    return { data, loading, error: error || collectionError, refresh };
}
