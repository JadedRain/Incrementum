import { createContext, useCallback, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiString, fetchWrapper } from "./FetchingHelper";
import type { DatabaseScreenerFilter, DatabaseScreenerContextType } from "./DatabaseScreenerTypes";

const DatabaseScreenerContext = createContext<DatabaseScreenerContextType | undefined>(undefined);

export const DatabaseScreenerProvider = ({ children }: { children: ReactNode }) => {
  const [filterDict, setFilterDict] = useState<Record<string, DatabaseScreenerFilter>>({});
  const [stocks, setStocks] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const getKey = (filter: DatabaseScreenerFilter) => `${filter.operand}__${filter.operator}`;

  const addFilter = useCallback((filter: DatabaseScreenerFilter) => {
    const key = getKey(filter);
    setFilterDict((prev) => ({ ...prev, [key]: filter }));
    return key;
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilterDict((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterDict({});
  }, []);

  useEffect(() => {
    const fetchStocks = async () => {
      const filterList = Object.values(filterDict);
      if (filterList.length === 0) {
        setStocks([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const body: { filters: DatabaseScreenerFilter[]; sort_by?: string; sort_order?: string } = {
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
  }, [filterDict, sortBy, sortAsc]);

  return (
    <DatabaseScreenerContext.Provider
      value={{
        filterList: Object.values(filterDict),
        addFilter,
        removeFilter,
        stocks,
        isLoading,
        error,
        clearFilters,
        sortBy,
        setSortBy,
        sortAsc,
        setSortAsc,
      }}
    >
      {children}
    </DatabaseScreenerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDatabaseScreenerContext = (): DatabaseScreenerContextType => {
  const context = useContext(DatabaseScreenerContext);
  if (!context) throw new Error("useDatabaseScreenerContext must be used within a DatabaseScreenerProvider");
  return context;
};
