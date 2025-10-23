import { useMemo } from 'react';

type CategoricalFilter = {
  filter_name: string;
  value: string | string[] | null;
};

export function useScreenerDefaults(data?: { categorical_filters?: CategoricalFilter[] }) {
  return useMemo(() => {
    const filterMap: Record<string, string[]> = {};
    if (!data || !Array.isArray(data.categorical_filters)) return { sectors: [], industries: [] };

    data.categorical_filters.forEach((f) => {
      const key = f.filter_name.toLowerCase();
      const values = Array.isArray(f.value) ? f.value : f.value ? [f.value] : [];
      if (!filterMap[key]) filterMap[key] = [];
      filterMap[key].push(...values);
    });

    return { sectors: filterMap['sector'] ?? [], industries: filterMap['industry'] ?? [] };
  }, [data]);
}
