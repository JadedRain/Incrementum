import { useEffect } from 'react';

interface FilterConfig {
  operand: string;
  operator: string;
  filter_type: 'numeric' | 'categoric';
  value: number | string | null;
}

interface SortConfig {
  sortBy: string;
  sortAsc: boolean;
}

interface ScreenerConfig {
  filters: FilterConfig[];
  sort: SortConfig;
}

// Configuration object for all predefined screeners
const SCREENER_CONFIGS: Record<string, ScreenerConfig> = {
  day_gainers: {
    filters: [
      { operand: 'pps', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 0.5 },
      { operand: 'latest_volume', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 100_000 },
      { operand: 'percent_change', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 2.50 },
    ],
    sort: { sortBy: 'percent_change', sortAsc: false },
  },
  day_losers: {
    filters: [
      { operand: 'pps', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 0.5 },
      { operand: 'latest_volume', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 100_000 },
      { operand: 'percent_change', operator: 'less_than_or_equal', filter_type: 'numeric', value: -250 },
    ],
    sort: { sortBy: 'percent_change', sortAsc: true },
  },
  most_actives: {
    filters: [
      { operand: 'pps', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 0.5 },
      { operand: 'latest_volume', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 100_000 },
      { operand: 'price_per_earnings', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 0},
      { operand: 'price_per_earnings', operator: 'less_than_or_equal', filter_type: 'numeric', value: 100},
    ],
    sort: { sortBy: 'volume', sortAsc: false },
  },
  undervalued_growth_stocks: {
    filters: [
      { operand: 'pps', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 0.5 },
      { operand: 'debt_to_equity', operator: 'less_than_or_equal', filter_type: 'numeric', value: 1.0 },
      { operand: 'price_per_earnings', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 0},
      { operand: 'price_per_earnings', operator: 'less_than_or_equal', filter_type: 'numeric', value: 50},
      { operand: 'price_per_sales', operator: 'less_than_or_equal', filter_type: 'numeric', value: 8},
      { operand: 'price_per_sales', operator: 'greater_than_or_equal', filter_type: 'numeric', value: 5},
      { operand: 'pe_per_growth', operator: 'less_than_or_equal', filter_type: 'numeric', value: 2},
    ],
    sort: { sortBy: 'price_per_earnings', sortAsc: true },
  },
};

const PREDEFINED_SCREENERS = [...Object.keys(SCREENER_CONFIGS), 'custom_temp'];

interface UsePredefinedScreenerFiltersParams {
  screenerId: string;
  batchUpdateFilters: (filters: FilterConfig[], sort: SortConfig) => void;
  clearFilters: () => void;
  skipPredefined?: boolean;
}

/**
 * Hook to apply predefined screener filters based on screener ID
 * Automatically clears and applies filters when the screener changes
 */
export function usePredefinedScreenerFilters({
  screenerId,
  batchUpdateFilters,
  clearFilters,
  skipPredefined,
}: UsePredefinedScreenerFiltersParams) {
  useEffect(() => {
    if (skipPredefined) return;

    const isPredefinedScreener = PREDEFINED_SCREENERS.includes(screenerId);
    
    if (!isPredefinedScreener) return;

    // Clear existing filters for predefined screeners
    clearFilters();

    // Apply configuration for the specific screener (if it exists)
    const config = SCREENER_CONFIGS[screenerId];
    if (config) {
      batchUpdateFilters(config.filters, config.sort);
    }
    // For 'custom_temp' (blank screener), no filters are applied after clearing
  }, [screenerId, batchUpdateFilters, clearFilters, skipPredefined]);
}
