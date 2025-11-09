import { useState } from 'react';

interface UseCollectionActionsProps {
  collectionName: string;
  apiKey: string | null;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
  onClearSearch: () => void;
  id?: string;
  setTokens: (tokens: string[]) => void;
}

export const useCollectionActions = ({ 
  collectionName, 
  apiKey, 
  onRefresh, 
  onError,
  onClearSearch,
  id,
  setTokens
}: UseCollectionActionsProps) => {
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);

  const addStock = async (symbol: string) => {
    if (!symbol || !apiKey) return;
    try {
      const res = await fetch("/custom-collection/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": apiKey,
        },
        body: JSON.stringify({ 
          collection: collectionName,
          symbols: [symbol.toUpperCase()]
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add stock");
      }
      
      onClearSearch();
      await onRefresh();
    } catch (err: any) {
      onError("Add: " + err.message);
    }
  };

  const removeStock = async (symbol: string) => {
    if (!apiKey) return;
    setPendingSymbol(symbol);
    
    try {
      const res = await fetch("/custom-collection/", {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": apiKey,
        },
        body: JSON.stringify({ 
          collection: collectionName,
          symbols: [symbol.toUpperCase()]
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove stock");
      }
      
      const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
      if (id) {
        const idx = collections.findIndex((c: any) => String(c.id) === String(id));
        if (idx !== -1) {
          collections[idx].stocks = collections[idx].stocks.filter((s: string) => s !== symbol);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(collections[idx].stocks);
        }
      }
      
      await onRefresh();
    } catch (err: any) {
      onError("Remove: " + err.message);
    } finally {
      setPendingSymbol(null);
    }
  };

  return { addStock, removeStock, pendingSymbol };
};
