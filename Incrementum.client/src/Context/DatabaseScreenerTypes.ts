export interface DatabaseScreenerFilter {
  operator: string;
  operand: string;
  filter_type: string;
  value?: string | number | boolean | null;
  value_high?: string | number | boolean | null;
  value_low?: string | number | boolean | null;
}

export interface DatabaseScreenerContextType {
  filterList: DatabaseScreenerFilter[];
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
}
