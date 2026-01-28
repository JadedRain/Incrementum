import { createContext, useCallback, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiString, fetchWrapper } from "./FetchingHelper";

export interface DatabaseScreenerFilter {
  operator: string;
  operand: string;
  filter_type: string;
  value?: any;
  value_high?: any;
  value_low?: any;
}

interface DatabaseScreenerContextType {
  filterList: DatabaseScreenerFilter[];
  addFilter: (filter: DatabaseScreenerFilter) => void;
  removeFilter: (index: number) => void;
  stocks: unknown[];
  isLoading: boolean;
  error: string | null;
  clearFilters: () => void;
  sortBy: string | null;
  setSortBy: (value: string | null) => void;
  sortAsc: boolean;
  setSortAsc: (value: boolean) => void;
}

const DatabaseScreenerContext = createContext<DatabaseScreenerContextType | undefined>(undefined);

export const DatabaseScreenerProvider = ({ children }: { children: ReactNode }) => {
  const [filterList, setFilterList] = useState<DatabaseScreenerFilter[]>([]);
  const [stocks, setStocks] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const addFilter = useCallback((filter: DatabaseScreenerFilter) => {
    setFilterList((prev) => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilterList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterList([]);
  }, []);

  useEffect(() => {
    const fetchStocks = async () => {
      if (filterList.length === 0) {
        setStocks([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const body: any = {
          filters: filterList,
        };
        if (sortBy) {
          body.sort_by = sortBy;
          body.sort_order = sortAsc ? 'asc' : 'desc';
        }
        const resp = await fetchWrapper(() =>
          fetch(apiString('/screeners/database/').toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        );
        const data = await resp.json();
        setStocks(data.stocks || []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocks();
  }, [filterList, sortBy, sortAsc]);

  return (
    <DatabaseScreenerContext.Provider
      value={{ filterList, addFilter, removeFilter, stocks, isLoading, error, clearFilters, sortBy, setSortBy, sortAsc, setSortAsc }}
    >
      {children}
    </DatabaseScreenerContext.Provider>
  );
};

export const useDatabaseScreenerContext = (): DatabaseScreenerContextType => {
  const context = useContext(DatabaseScreenerContext);
  if (!context) throw new Error("useDatabaseScreenerContext must be used within a DatabaseScreenerProvider");
  return context;
};
