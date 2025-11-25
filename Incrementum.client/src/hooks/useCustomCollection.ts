import { useState, useEffect } from 'react';
import { apiString, fetchWrapper } from "../Context/FetchingHelper";
interface UseCustomCollectionProps {
  id?: string;
  apiKey: string | null;
}

interface CustomCollectionItem {
  id?: string | number;
  name?: string;
  collection_name?: string;
  c_desc?: string;
  desc?: string;
  stocks?: string[];
  [key: string]: unknown;
}

interface ApiToken {
  symbol?: string;
  [key: string]: unknown;
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

      let collections = JSON.parse(localStorage.getItem('customCollections') || '[]') as CustomCollectionItem[];
      const collection = collections.find((c: CustomCollectionItem) => String(c.id) === String(id));
      
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
        const res = await fetchWrapper(()=>fetch(apiString(`/custom-collection/?collection=${encodeURIComponent(collectionNameForApi)}`), {
          headers: { 'X-User-Id': apiKey }
        }));
        
        if (!res.ok) {
          const text = await res.text();
          try {
            const errorData = JSON.parse(text) as { error?: string };
            if (errorData.error && (errorData.error.includes('does not exist') || errorData.error.includes('Invalid or expired session'))) {
              setError('Your session has expired. Please log in again.');
              return;
            }
          } catch {
            // not JSON, continue
          }
          throw new Error(`Failed to fetch collection: ${res.status}`);
        }
        
        const data = await res.json() as { tokens?: ApiToken[] };
        const symbols = (data.tokens?.map((t: ApiToken) => t.symbol).filter(Boolean) as string[]) || [];
        setTokens(symbols);
        
        collections = JSON.parse(localStorage.getItem('customCollections') || '[]') as CustomCollectionItem[];
        const idx = collections.findIndex((c: CustomCollectionItem) => String(c.id) === String(id));
        if (idx !== -1) {
          collections[idx].stocks = symbols;
          localStorage.setItem('customCollections', JSON.stringify(collections));
          const actualName = collections[idx].name || collections[idx].collection_name || `Collection ${idx + 1}`;
          const actualDesc = collections[idx].c_desc || collections[idx].desc || '';
          setCollectionName(actualName);
          setCollectionDesc(actualDesc);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError("Failed to fetch collection: " + message);
      }
    };

    fetchCollection();
  }, [id, apiKey]);

  const refreshCollection = async () => {
    if (!id || !apiKey || !collectionName) return;
    try {
      const res = await fetchWrapper(()=>fetch(apiString(`/custom-collection/?collection=${encodeURIComponent(collectionName)}`), {
        headers: { 'X-User-Id': apiKey }
      }));
      const data = await res.json() as { tokens?: ApiToken[] };
      const symbols = (data.tokens?.map((t: ApiToken) => t.symbol).filter(Boolean) as string[]) || [];
      setTokens(symbols);
      
      const collections = JSON.parse(localStorage.getItem('customCollections') || '[]') as CustomCollectionItem[];
      const idx = collections.findIndex((c: CustomCollectionItem) => String(c.id) === String(id));
      if (idx !== -1) {
        collections[idx].stocks = symbols;
        localStorage.setItem('customCollections', JSON.stringify(collections));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError("Refresh: " + message);
    }
  };

  const updateCollectionName = async (newName: string, newDesc?: string) => {
    if (!newName.trim()) {
      setError("Collection name cannot be empty");
      return false;
    }

    const oldName = collectionName;
    const oldDesc = collectionDesc;
    
    setCollectionName(newName);
    if (typeof newDesc === 'string') setCollectionDesc(newDesc);
    
    const collections = JSON.parse(localStorage.getItem('customCollections') || '[]') as CustomCollectionItem[];
    if (id) {
      const idx = collections.findIndex((c: CustomCollectionItem) => String(c.id) === String(id));
      if (idx !== -1) {
        collections[idx].name = newName;
        if (typeof newDesc === 'string') collections[idx].c_desc = newDesc;
        localStorage.setItem('customCollections', JSON.stringify(collections));
      }
    }

    if (apiKey && oldName) {
      try {
        const res = await fetchWrapper(()=>fetch(apiString('/custom-collection/'), {
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
        }));

        if (!res.ok) {
          const errorData = await res.json() as { error?: string };
          throw new Error(errorData.error || 'Failed to update collection name');
        }

        const data = await res.json() as { collection?: { name?: string; desc?: string } };
        if (data.collection?.name) {
          setCollectionName(data.collection.name);
          if (data.collection?.desc) setCollectionDesc(data.collection.desc || '');
          
          const updatedCollections = JSON.parse(localStorage.getItem('customCollections') || '[]') as CustomCollectionItem[];
          if (id) {
            const idx = updatedCollections.findIndex((c: CustomCollectionItem) => String(c.id) === String(id));
            if (idx !== -1) {
              updatedCollections[idx].name = data.collection.name;
              if (typeof data.collection.desc !== 'undefined') updatedCollections[idx].c_desc = data.collection.desc;
              localStorage.setItem('customCollections', JSON.stringify(updatedCollections));
            }
          }
        }
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setCollectionName(oldName);
        setCollectionDesc(oldDesc);
        const revertCollections = JSON.parse(localStorage.getItem('customCollections') || '[]') as CustomCollectionItem[];
        if (id) {
          const idx = revertCollections.findIndex((c: CustomCollectionItem) => String(c.id) === String(id));
          if (idx !== -1) {
            revertCollections[idx].name = oldName;
            if (typeof oldDesc !== 'undefined') revertCollections[idx].c_desc = oldDesc;
            localStorage.setItem('customCollections', JSON.stringify(revertCollections));
          }
        }
        setError("Failed to update collection name: " + message);
        return false;
      }
    }
  };

  return { tokens, setTokens, collectionName, collectionDesc, updateCollectionName, error, setError, refreshCollection };
};