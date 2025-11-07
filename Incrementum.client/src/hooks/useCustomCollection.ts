import { useState, useEffect } from 'react';

interface UseCustomCollectionProps {
  id?: string;
  apiKey: string | null;
}

export const useCustomCollection = ({ id, apiKey }: UseCustomCollectionProps) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCollection = async () => {
      let collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
      let collection = id 
        ? collections.find((c: any) => String(c.id) === String(id))
        : collections[collections.length - 1];
      
      if (collection) {
        setTokens(collection.stocks || []);
        // Check both 'name' and 'collection_name' fields for compatibility
        const actualName = collection.name || collection.collection_name || `Collection ${collections.length}`;
        setCollectionName(actualName);
      }
      
      if (!id || !apiKey) return;

      try {
        const res = await fetch(`/custom-collection/${id}/`, {
          headers: { 'X-User-Id': apiKey }
        });
        
        if (!res.ok) {
          const text = await res.text();
          try {
            const errorData = JSON.parse(text);
            if (errorData.error?.includes('does not exist') || errorData.error?.includes('Invalid or expired session')) {
              setError('Your session has expired. Please log in again.');
              return;
            }
          } catch {
            // not JSON, continue
          }
          throw new Error(`Failed to fetch collection: ${res.status}`);
        }
        
        const data = await res.json();
        const symbols = data.tokens?.map((t: any) => t.symbol) || [];
        setTokens(symbols);
        
        collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
        const idx = collections.findIndex((c: any) => String(c.id) === String(id));
        if (idx !== -1) {
          collections[idx].stocks = symbols;
          localStorage.setItem('customCollections', JSON.stringify(collections));
          const actualName = collections[idx].name || collections[idx].collection_name || `Collection ${idx + 1}`;
          setCollectionName(actualName);
        }
      } catch (err: any) {
        setError("Failed to fetch collection: " + err.message);
      }
    };

    fetchCollection();
  }, [id, apiKey]);

  const refreshCollection = async () => {
    if (!id || !apiKey) return;
    try {
      const res = await fetch(`/custom-collection/${id}/`, {
        headers: { 'X-User-Id': apiKey }
      });
      const data = await res.json();
      const symbols = data.tokens?.map((t: any) => t.symbol) || [];
      setTokens(symbols);
      
      const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
      const idx = collections.findIndex((c: any) => String(c.id) === String(id));
      if (idx !== -1) {
        collections[idx].stocks = symbols;
        localStorage.setItem('customCollections', JSON.stringify(collections));
      }
    } catch (err: any) {
      setError("Refresh: " + err.message);
    }
  };

  const updateCollectionName = async (newName: string) => {
    setCollectionName(newName);
    
    // Update localStorage
    const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
    if (id) {
      const idx = collections.findIndex((c: any) => String(c.id) === String(id));
      if (idx !== -1) {
        collections[idx].name = newName;
        localStorage.setItem('customCollections', JSON.stringify(collections));
      }
    }
  };

  return { tokens, setTokens, collectionName, updateCollectionName, error, setError, refreshCollection };
};
