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
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | null>(15);
  const [totalCount, setTotalCount] = useState<number>(0);
  const getKey = (filter: DatabaseScreenerFilter) => {
    if (filter.filter_type === 'numeric') {
      return `${filter.operand}__${filter.operator}`;
    }
    if (filter.value !== undefined && filter.value !== null) {
      return `${filter.operand}__${filter.operator}__${filter.value}`;
    }
    return `${filter.operand}__${filter.operator}`;
  };

  const addFilter = useCallback((filter: DatabaseScreenerFilter) => {
    const key = getKey(filter);
    setFilterDict((prev) => {
      const updated = { ...prev, [key]: filter };
      console.log('Filter added:', updated);
      return updated;
    });
    // reset to first page when filters change
    setPage(1);
    return key;
  }, [setPage]);

  const removeFilter = useCallback((key: string) => {
    setFilterDict((prev) => {
      const updated = { ...prev };
      delete updated[key];
      console.log('Filter removed:', updated);
      return updated;
    });
    // reset to first page when filters change
    setPage(1);
  }, [setPage]);

  const clearFilters = useCallback(() => {
    setFilterDict({});
    // reset to first page when filters are cleared
    setPage(1);
  }, [setPage]);

  useEffect(() => {
    const fetchStocks = async () => {
      const filterList = Object.values(filterDict);
      // Always fetch from the server even when there are no filters.
      // Server will return the default first 25 alphabetical stocks when filters is an empty array.
      setIsLoading(true);
      setError(null);
      try {
        const body: { filters: DatabaseScreenerFilter[]; sort_by?: string; sort_order?: string; page?: number; page_size?: number | null } = {
          filters: filterList,
          page,
          page_size: pageSize,
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
        setTotalCount(data.total_count || 0);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocks();
  }, [filterDict, sortBy, sortAsc, page, pageSize]);

  return (
    <DatabaseScreenerContext.Provider
      value={{
        filterList: Object.values(filterDict),
        filterDict, // expose for filter components
        addFilter,
        removeFilter,
        stocks,
        isLoading,
        error,
        clearFilters,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalCount,
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
