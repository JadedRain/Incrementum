import React, { useState } from 'react';

interface Collection {
  id: string | number;
  name?: string;
  collection_name?: string;
  stocks?: string[];
}

interface UseCollectionActionsProps {
  collectionName: string;
  apiKey: string | null;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
  onClearSearch: () => void;
  id?: string;
  setTokens: React.Dispatch<React.SetStateAction<string[]>>;
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
    if (!symbol) return;

    if (!id) {
        const up = symbol.toUpperCase();
        const collections: Collection[] = JSON.parse(localStorage.getItem('customCollections') || '[]');
        const idx = collections.findIndex((c: Collection) => String(c.name) === String(collectionName) || String(c.collection_name) === String(collectionName));
        if (idx === -1) {
          const newCollection: Collection = { id: Date.now(), name: collectionName || `Collection ${Date.now()}`, stocks: [up] };
          collections.push(newCollection);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(newCollection.stocks || []);
        } else {
          collections[idx].stocks = collections[idx].stocks || [];
          if (!collections[idx].stocks.includes(up)) collections[idx].stocks.push(up);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(collections[idx].stocks);
        }
        onClearSearch();
      return;
    }

    if (!apiKey) {
      onError('You must be logged in to add to an existing collection');
      return;
    }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      onError("Add: " + message);
    }
  };

  const removeStock = async (symbol: string) => {
    if (!symbol) return;
    setPendingSymbol(symbol);

    if (!id) {
      try {
        const up = String(symbol).toUpperCase();
        const collections: Collection[] = JSON.parse(localStorage.getItem('customCollections') || '[]');
        const idx = collections.findIndex((c: Collection) => String(c.name) === String(collectionName) || String(c.collection_name) === String(collectionName));
        if (idx !== -1) {
          collections[idx].stocks = (collections[idx].stocks || []).filter((s: string) => String(s).toUpperCase() !== up);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(collections[idx].stocks || []);
        } else {
          setTokens((prev) => Array.isArray(prev) ? prev.filter(s => String(s).toUpperCase() !== up) : []);
        }
      } catch {
        setTokens((prev) => Array.isArray(prev) ? prev.filter(s => String(s).toUpperCase() !== String(symbol).toUpperCase()) : []);
      } finally {
        setPendingSymbol(null);
      }
      return;
    }

    if (!apiKey) {
      onError('You must be logged in to remove from an existing collection');
      setPendingSymbol(null);
      return;
    }

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
      
      const collections: Collection[] = JSON.parse(localStorage.getItem('customCollections') || '[]');
      if (id) {
        const idx = collections.findIndex((c: Collection) => String(c.id) === String(id));
        if (idx !== -1) {
          collections[idx].stocks = (collections[idx].stocks || []).filter((s: string) => s !== symbol);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(collections[idx].stocks || []);
        }
      }
      
      await onRefresh();
      } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      onError("Remove: " + message);
    } finally {
      setPendingSymbol(null);
    }
  };

  return { addStock, removeStock, pendingSymbol };
};