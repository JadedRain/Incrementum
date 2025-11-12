import { useState } from 'react';
import { saveCollection as svcSave } from '../services/collectionService';
import type { SaveResult } from '../Types/collections';

interface UseSaveCollectionOpts {
  apiKey?: string | null;
  setTokens: (t: string[]) => void;
  resetForm: () => void;
  onError?: (msg: string) => void;
}

export const useSaveCollection = ({ apiKey, setTokens, resetForm, onError }: UseSaveCollectionOpts) => {
  const [saving, setSaving] = useState(false);

  const saveCollection = async (payload: { name: string; desc?: string; symbols: string[] }): Promise<SaveResult> => {
    setSaving(true);
    try {
      if (!payload.name || !payload.name.trim()) {
        const err = 'Collection name required';
        if (onError) onError(err);
        return { ok: false, error: err };
      }

      if (!payload.symbols || payload.symbols.length === 0) {
        const err = 'At least one symbol required';
        if (onError) onError(err);
        return { ok: false, error: err };
      }

      const res = await svcSave({ collection: payload.name, symbols: payload.symbols, desc: payload.desc, apiKey });
      if (!res.ok && onError) onError(res.error || 'Save failed');

      if (res.ok) {
        try {
          setTokens([]);
        } catch {
          void 0;
        }
        try {
          resetForm();
        } catch {
          void 0;
        }
      }

      return res;
    } catch (err: unknown) {
      const message = String(err);
      if (onError) onError(message);
      return { ok: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  return { saveCollection, saving } as const;
};

export default useSaveCollection;