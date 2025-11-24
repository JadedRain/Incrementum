import React, { useState } from 'react';

interface UseCollectionActionsProps {
  collectionName: string;
  apiKey: string | null;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
  id?: string;
  setTokens: React.Dispatch<React.SetStateAction<string[]>>;
}

type Collection = {
  id: string;
  name: string;
  collection_name: string;
  stocks: string[];
}

export const useCollectionActions = ({ 
  collectionName, 
  apiKey, 
  onRefresh, 
  onError,
  id,
  setTokens
}: UseCollectionActionsProps) => {
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);

  const addStock = async (symbol: string) => {
    if (!symbol) return;

    if (!id) {
        const up = symbol.toUpperCase();
        const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
        console.log(collectionName)

        const idx = collections.findIndex((c: Collection) => 
          String(c.name) === String(collectionName) || 
          String(c.collection_name) === String(collectionName)
        );
        
        if (idx === -1) {
          const uniqueName = collectionName
          const newCollection = { id: uniqueName, name: uniqueName, stocks: [up] };
          collections.push(newCollection);
          console.log(collections)
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(newCollection.stocks);
        } else {
          collections[idx].stocks = collections[idx].stocks || [];
          if (!collections[idx].stocks.includes(up)) collections[idx].stocks.push(up);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(collections[idx].stocks);
        }
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
      
      await onRefresh();
    } catch (err: any) {
      onError("Add: " + err.message);
    }
  };

  const removeStock = async (symbol: string) => {
    if (!symbol) return;
    setPendingSymbol(symbol);

    if (!id) {
      try {
        const up = String(symbol).toUpperCase();
        const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
        const idx = collections.findIndex((c: any) => String(c.name) === String(collectionName) || String(c.collection_name) === String(collectionName));
        if (idx !== -1) {
          collections[idx].stocks = (collections[idx].stocks || []).filter((s: string) => String(s).toUpperCase() !== up);
          localStorage.setItem('customCollections', JSON.stringify(collections));
          setTokens(collections[idx].stocks || []);
        } else {
          setTokens((prev) => Array.isArray(prev) ? prev.filter(s => String(s).toUpperCase() !== up) : []);
        }
      } catch (e) {
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