import { useState } from 'react';
import { apiString, fetchWrapper } from "../Context/FetchingHelper";
interface UseCreateCollectionFormOptions {
  initialName?: string;
  initialDesc?: string;
  onError?: (msg: string) => void;
}

export const useCreateCollectionForm = (opts?: UseCreateCollectionFormOptions) => {
  const [pendingName, setPendingName] = useState<string>(opts?.initialName || '');
  const [pendingDescription, setPendingDescription] = useState<string>(opts?.initialDesc || '');
  const [newToken, setNewToken] = useState<string>('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const searchStocks = async () => {
    if (!newToken) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetchWrapper(()=>fetch(apiString(`/stocks/search/${encodeURIComponent(newToken)}/0/`)));
      if (!res.ok) throw new Error('Failed to search stocks');
      const data = await res.json();
      setSearchResults((data && (data.results || data)) || []);
    } catch (err: unknown) {
      if (opts?.onError) opts.onError('Search: ' + String(err));
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setNewToken('');
    setSearchResults([]);
  };

  const resetForm = () => {
    setPendingName('');
    setPendingDescription('');
    setNewToken('');
    setSearchResults([]);
    setSearching(false);
  };

  return {
    pendingName,
    setPendingName,
    pendingDescription,
    setPendingDescription,
    newToken,
    setNewToken,
    searchResults,
    searching,
    searchStocks,
    clearSearch,
    resetForm,
  } as const;
};

export default useCreateCollectionForm;