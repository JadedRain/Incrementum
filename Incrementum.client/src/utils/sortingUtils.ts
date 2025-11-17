import type { StockInfo } from '../Types/StockInfoTypes';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'name' | 'price' | 'percentChange' | 'volume' | 'marketCap';

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export function sortStocks(stocks: StockInfo[], field: SortField, direction: 'asc' | 'desc'): StockInfo[] {
  // Create a copy to avoid mutating the original array
  const sortedStocks = [...stocks];
  
  // Helper function to get the value for a given field
  const getFieldValue = (stock: StockInfo, field: SortField): number | string | undefined => {
    switch (field) {
      case 'name':
        return stock.shortName?.toLowerCase() ?? stock.symbol?.toLowerCase();
      case 'price':
        return stock.regularMarketPrice;
      case 'percentChange':
        return stock.regularMarketChangePercent;
      case 'volume': {
        // Create a typed fallback object for optional numeric fields that might not be declared on StockInfo
        const extra = stock as unknown as {
          regularMarketVolume?: number;
          averageDailyVolume3Month?: number;
          averageVolume?: number;
          volume?: number;
        };
        return extra.regularMarketVolume ?? extra.averageDailyVolume3Month ?? extra.averageVolume ?? extra.volume;
      }
      case 'marketCap':
        return stock.marketCap;
      default:
        return undefined;
    }
  };
  
  // Sort with stable sort behavior
  sortedStocks.sort((a, b) => {
    const aValue = getFieldValue(a, field);
    const bValue = getFieldValue(b, field);
    
    // Handle undefined/null values - push them to the end
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    }
    
    // Apply direction
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sortedStocks;
}

export function getNextSortDirection(
  currentField: SortField | null,
  clickedField: SortField,
  currentDirection: SortDirection
): SortDirection {
  // If clicking a different column, start with ascending
  if (currentField !== clickedField) {
    return 'asc';
  }
  
  // If clicking the same column, toggle through: asc -> desc -> null
  if (currentDirection === null) {
    return 'asc';
  } else if (currentDirection === 'asc') {
    return 'desc';
  } else {
    return null;
  }
}