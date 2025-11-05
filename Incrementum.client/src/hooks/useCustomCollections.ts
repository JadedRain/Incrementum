import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';

export interface CustomCollection {
  id: number;
  name: string;
  description?: string;
  stocks?: string[];
}

export function useCustomCollections() {
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const fetchCollections = async () => {
      console.debug('useCustomCollections: fetching collections, apiKey=', auth?.apiKey);
      try {
        const apiKey = auth?.apiKey;
        const devBase = (typeof window !== 'undefined' && window.location && window.location.port === '5173') ? 'http://localhost:8000' : '';
        if (apiKey) {
          const res = await fetch(`${devBase}/custom-collections/`, {
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': apiKey,
            }
          });
          if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
              console.warn('useCustomCollections: server returned non-json content-type', ct);
            } else {
              const data = await res.json();
              console.debug('useCustomCollections: server collections response', data);
              setCollections(data.collections || []);
              return;
            }
          }
        }

        // const stored = localStorage.getItem('customCollections');
        // if (stored) {
        //   const parsed = JSON.parse(stored);
        //   // eslint-disable-next-line no-console
        //   console.debug('useCustomCollections: loaded from localStorage', parsed);
        //   setCollections(parsed);
        // } else {
        //   setCollections([]);
        // }
      } catch (err) {
        console.warn('useCustomCollections: failed to fetch collections, falling back to localStorage', err);
        const stored = localStorage.getItem('customCollections');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.debug('useCustomCollections: fallback localStorage', parsed);
          setCollections(parsed);
        } else {
          setCollections([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [auth]);

  const saveCollections = (updated: CustomCollection[]) => {
    setCollections(updated);
    localStorage.setItem('customCollections', JSON.stringify(updated));
  };

  return { collections, setCollections: saveCollections, loading };
}
