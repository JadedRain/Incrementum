import { useEffect, useState, useCallback } from 'react';
import type { StockInfo } from '../Types/StockInfo';

type UseScreenerParams = {
  selectedSectors?: string[];
  selectedIndustries?: string[];
  percentThreshold?: string;
  percentChangeFilter?: string;
  changePeriod?: 'daily' | 'weekly' | 'monthly';
  max?: number;
  offset?: number;
};

export function useScreener(params: UseScreenerParams) {
  const { selectedSectors, selectedIndustries, percentThreshold, percentChangeFilter, changePeriod, max = 10, offset = 0 } = params;
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStocks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('max', String(max));
      params.set('offset', String(offset));

      const filters: any = {};
      if (selectedSectors && selectedSectors.length) filters.sectors = selectedSectors;
      if (selectedIndustries && selectedIndustries.length) filters.industries = selectedIndustries;
      if (percentThreshold) {
        filters.percent_change_filter = percentChangeFilter;
        filters.percent_change_value = percentThreshold;
        filters.percent_change_period = changePeriod;
      }
      if (Object.keys(filters).length) params.set('filters', JSON.stringify(filters));

      const resp = await fetch(`/getStockInfo/?${params.toString()}`, { signal });
      const data = await resp.json();
      const newStocks = (data.stocks || []).slice(0, 4);
      setStocks(newStocks);
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSectors, selectedIndustries, percentThreshold, percentChangeFilter, changePeriod, max, offset]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStocks(controller.signal);
    return () => controller.abort();
  }, [fetchStocks]);

  return { stocks, loading, error, refetch: fetchStocks } as const;
}
