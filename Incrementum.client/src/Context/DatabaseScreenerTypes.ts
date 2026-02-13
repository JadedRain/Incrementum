export interface DatabaseScreenerFilter {
  operator: string;
  operand: string;
  filter_type: string;
  value?: string | number | boolean | null;
}

export interface DatabaseScreenerContextType {
  filterList: DatabaseScreenerFilter[];
  filterDict: Record<string, DatabaseScreenerFilter>;
  addFilter: (filter: DatabaseScreenerFilter) => string;
  removeFilter: (key: string) => void;
  stocks: unknown[];
  isLoading: boolean;
  error: string | null;
  clearFilters: () => void;
  sortBy: string | null;
  setSortBy: (value: string | null) => void;
  sortAsc: boolean;
  setSortAsc: (value: boolean) => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number | null;
  setPageSize: (s: number | null) => void;
  totalCount: number;
}
