import type { StockInfo } from '../Types/StockInfoTypes';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'name' | 'price' | 'percentChange' | 'volume' | 'marketCap' | 'dateAdded' | 'recentlyViewed' | 'purchasePrice';

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export function sortStocks(stocks: StockInfo[], field: SortField, direction: 'asc' | 'desc'): StockInfo[] {
  const sortedStocks = [...stocks];
  
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
      case 'purchasePrice': {
        const extra = stock as unknown as { purchasePrice?: string | number };
        const val = extra.purchasePrice;
        if (val === undefined || val === null || val === '') return undefined;
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        const result = isNaN(num) ? undefined : num;
        return result;
      }
      case 'dateAdded': {
        const extra = stock as unknown as { dateAdded?: string | number };
        const val = extra.dateAdded;
        if (!val) return undefined;
        // If it's already a timestamp, use it; otherwise parse as ISO string
        const result = typeof val === 'number' ? val : new Date(val).getTime();
        return result;
      }
      case 'recentlyViewed': {
        const extra = stock as unknown as { lastViewed?: string | number };
        const val = extra.lastViewed;
        if (!val) return undefined; // Changed from 0 to undefined so unviewed go to end
        const result = typeof val === 'number' ? val : new Date(val).getTime();
        return result;
      }
      default:
        return undefined;
    }
  };
  
  // Debug log for sorting
  console.debug(`Sorting by ${field} (${direction}), sample values:`, 
    stocks.slice(0, 3).map(s => ({ 
      symbol: s.symbol, 
      value: getFieldValue(s, field) 
    }))
  );
  
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