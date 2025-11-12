import { useState, useEffect } from 'react';

interface UseCustomCollectionProps {
  id?: string;
  apiKey: string | null;
}

export const useCustomCollection = ({ id, apiKey }: UseCustomCollectionProps) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDesc, setCollectionDesc] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) {
        setTokens([]);
        setCollectionName("");
        setCollectionDesc("");
        return;
      }

      let collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
      const collection = collections.find((c: any) => String(c.id) === String(id));
      
      if (collection) {
        setTokens(collection.stocks || []);
        const actualName = collection.name || collection.collection_name || `Collection ${collections.length}`;
        const actualDesc = collection.c_desc || collection.desc || '';
        setCollectionName(actualName);
        setCollectionDesc(actualDesc);
      }

      if (!apiKey) return;

      const collectionNameForApi = collection?.name || collection?.collection_name;
      if (!collectionNameForApi) {
        setError('Collection name not found');
        return;
      }

      try {
        const res = await fetch(`/custom-collection/?collection=${encodeURIComponent(collectionNameForApi)}`, {
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
          const actualDesc = collections[idx].c_desc || collections[idx].desc || '';
          setCollectionName(actualName);
          setCollectionDesc(actualDesc);
        }
      } catch (err: any) {
        setError("Failed to fetch collection: " + err.message);
      }
    };

    fetchCollection();
  }, [id, apiKey]);

  const refreshCollection = async () => {
    if (!id || !apiKey || !collectionName) return;
    try {
      const res = await fetch(`/custom-collection/?collection=${encodeURIComponent(collectionName)}`, {
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

  const updateCollectionName = async (newName: string, newDesc?: string) => {
    if (!newName.trim()) {
      setError("Collection name cannot be empty");
      return;
    }

    const oldName = collectionName;
    const oldDesc = collectionDesc;
    
    setCollectionName(newName);
    if (typeof newDesc === 'string') setCollectionDesc(newDesc);
    
    const collections = JSON.parse(localStorage.getItem('customCollections') || '[]');
    if (id) {
      const idx = collections.findIndex((c: any) => String(c.id) === String(id));
      if (idx !== -1) {
        collections[idx].name = newName;
        if (typeof newDesc === 'string') collections[idx].c_desc = newDesc;
        localStorage.setItem('customCollections', JSON.stringify(collections));
      }
    }

    if (apiKey && oldName) {
      try {
        const res = await fetch('/custom-collection/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': apiKey
          },
          body: JSON.stringify({
            collection: oldName,
            new_name: newName,
            new_desc: typeof newDesc === 'string' ? newDesc : undefined
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update collection name');
        }

        const data = await res.json();
        if (data.collection?.name) {
          setCollectionName(data.collection.name);
          if (data.collection?.desc) setCollectionDesc(data.collection.desc || '');
          
          const updatedCollections = JSON.parse(localStorage.getItem('customCollections') || '[]');
          if (id) {
            const idx = updatedCollections.findIndex((c: any) => String(c.id) === String(id));
            if (idx !== -1) {
              updatedCollections[idx].name = data.collection.name;
              if (typeof data.collection.desc !== 'undefined') updatedCollections[idx].c_desc = data.collection.desc;
              localStorage.setItem('customCollections', JSON.stringify(updatedCollections));
            }
          }
        }
      } catch (err: any) {
        setCollectionName(oldName);
        setCollectionDesc(oldDesc);
        const revertCollections = JSON.parse(localStorage.getItem('customCollections') || '[]');
        if (id) {
          const idx = revertCollections.findIndex((c: any) => String(c.id) === String(id));
          if (idx !== -1) {
            revertCollections[idx].name = oldName;
            if (typeof oldDesc !== 'undefined') revertCollections[idx].c_desc = oldDesc;
            localStorage.setItem('customCollections', JSON.stringify(revertCollections));
          }
        }
        setError("Failed to update collection name: " + err.message);
      }
    }
  };

  return { tokens, setTokens, collectionName, collectionDesc, updateCollectionName, error, setError, refreshCollection };
};