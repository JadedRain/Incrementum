import { useState, useEffect } from 'react';

export interface CustomCollection {
  id: number;
  name: string;
  description?: string;
}

export function useCustomCollections() {
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('customCollections');
    if (stored) {
      setCollections(JSON.parse(stored));
    } else {
      setCollections([]);
    }
    setLoading(false);
  }, []);

  const saveCollections = (updated: CustomCollection[]) => {
    setCollections(updated);
    localStorage.setItem('customCollections', JSON.stringify(updated));
  };

  return { collections, setCollections: saveCollections, loading };
}
