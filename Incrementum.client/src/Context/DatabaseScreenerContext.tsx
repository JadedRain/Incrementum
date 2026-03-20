import { createContext, useCallback, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { apiString, fetchWrapper } from "./FetchingHelper";
import type { DatabaseScreenerFilter, DatabaseScreenerContextType } from "./DatabaseScreenerTypes";

const DatabaseScreenerContext = createContext<DatabaseScreenerContextType | undefined>(undefined);

export const DatabaseScreenerProvider = ({ children }: { children: ReactNode }) => {
  const [filterDict, setFilterDict] = useState<Record<string, DatabaseScreenerFilter>>({});
  const historyRef = useRef<Record<string, DatabaseScreenerFilter>[]>([]);
  const futureRef = useRef<Record<string, DatabaseScreenerFilter>[]>([]);
  const [stocks, setStocks] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const isBatchUpdating = useRef(false);
  const [pagination, setPagination] = useState<{
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null>(null);

  const areFilterDictsEqual = (a: Record<string, DatabaseScreenerFilter>, b: Record<string, DatabaseScreenerFilter>) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      const aFilter = a[key];
      const bFilter = b[key];
      if (!bFilter) return false;
      if (
        aFilter.operand !== bFilter.operand ||
        aFilter.operator !== bFilter.operator ||
        aFilter.filter_type !== bFilter.filter_type ||
        aFilter.value !== bFilter.value
      ) {
        return false;
      }
    }
    return true;
  };
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
      historyRef.current.push(prev);
      futureRef.current = [];
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
      historyRef.current.push(prev);
      futureRef.current = [];
      const updated = { ...prev };
      delete updated[key];
      console.log('Filter removed:', updated);
      return updated;
    });
    // reset to first page when filters change
    setPage(1);
  }, [setPage]);

  const clearFilters = useCallback(() => {
    setFilterDict((prev) => {
      historyRef.current.push(prev);
      futureRef.current = [];
      return {};
    });
    // reset to first page when filters are cleared
    setPage(1);
  }, [setPage]);

  const batchUpdateFilters = useCallback((
    filters: DatabaseScreenerFilter[],
    options?: { sortBy?: string; sortAsc?: boolean }
  ) => {
    isBatchUpdating.current = true;
    
    const newFilterDict: Record<string, DatabaseScreenerFilter> = {};
    filters.forEach(filter => {
      const key = getKey(filter);
      newFilterDict[key] = filter;
    });
    
    setFilterDict((prev) => {
      historyRef.current.push(prev);
      futureRef.current = [];
      return newFilterDict;
    });
    setPage(1);
    
    if (options?.sortBy !== undefined) {
      setSortBy(options.sortBy);
    }
    if (options?.sortAsc !== undefined) {
      setSortAsc(options.sortAsc);
    }
    
    // Allow fetch on next render
    setTimeout(() => {
      isBatchUpdating.current = false;
    }, 0);
  }, [setPage]);

  const undoFilters = useCallback(() => {
    setFilterDict((current) => {
      if (historyRef.current.length === 0) {
        return current;
      }
      const previous = historyRef.current[historyRef.current.length - 1];
      if (!previous || areFilterDictsEqual(previous, current)) {
        return current;
      }
      historyRef.current.pop();
      futureRef.current.push(current);
      setPage(1);
      return previous;
    });
  }, [setPage]);

  const redoFilters = useCallback(() => {
    setFilterDict((current) => {
      if (futureRef.current.length === 0) {
        return current;
      }
      const next = futureRef.current[futureRef.current.length - 1];
      if (!next || areFilterDictsEqual(next, current)) {
        return current;
      }
      futureRef.current.pop();
      historyRef.current.push(current);
      setPage(1);
      return next;
    });
  }, [setPage]);

  useEffect(() => {
    // Skip fetch during batch updates
    if (isBatchUpdating.current) {
      return;
    }
    
    const fetchStocks = async () => {
      const filterList = Object.values(filterDict);
      setIsLoading(true);
      setError(null);
      try {
        const body: { filters: DatabaseScreenerFilter[]; sort_by?: string; sort_order?: string; page: number; per_page: number } = {
          filters: filterList,
          page,
          per_page: perPage,
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
        console.log('API Response data:', data);
        console.log('Stocks received:', data.stocks);
        console.log('Pagination:', data.pagination);
        if (data.stocks && data.stocks.length > 0) {
          console.log('First stock:', data.stocks[0]);
          console.log('Stock keys:', Object.keys(data.stocks[0]));
        }
        setStocks(data.stocks || []);
        setPagination(data.pagination || null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocks();
  }, [filterDict, sortBy, sortAsc, page, perPage]);

  return (
    <DatabaseScreenerContext.Provider
      value={{
        filterList: Object.values(filterDict),
        filterDict,
        addFilter,
        removeFilter,
        stocks,
        isLoading,
        error,
        clearFilters,
        batchUpdateFilters,
        undoFilters,
        redoFilters,
        sortBy,
        setSortBy,
        sortAsc,
        setSortAsc,
        page,
        setPage,
        perPage,
        setPerPage,
        pagination,
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
