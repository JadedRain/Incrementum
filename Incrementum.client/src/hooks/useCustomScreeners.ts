import { useEffect, useState } from 'react';

export interface CustomScreener {
  id: number;
  screener_name: string;
  created_at: string;
  filter_count?: number;
}

export function useCustomScreeners(apiKey?: string) {
  const [customScreeners, setCustomScreeners] = useState<CustomScreener[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomScreeners = async () => {
      if (!apiKey) return;
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/custom-screeners/', {
          headers: {
            'X-User-Id': apiKey,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCustomScreeners(data.screeners || []);
        }
      } catch (error) {
        setCustomScreeners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomScreeners();
  }, [apiKey]);

  return { customScreeners, loading };
}
