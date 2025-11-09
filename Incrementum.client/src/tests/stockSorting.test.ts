import { describe, it, expect } from '@jest/globals';
import type { StockInfo } from '../Types/StockInfoTypes';
import { sortStocks, getNextSortDirection } from '../utils/sortingUtils';

describe('Stock Sorting Business Logic', () => {
  const mockStocks: StockInfo[] = [
    {
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      regularMarketPrice: 150.0,
      regularMarketChangePercent: 2.5,
      volume: 80000000,
      marketCap: 2500000000000,
    },
    {
      symbol: 'MSFT',
      shortName: 'Microsoft Corporation',
      regularMarketPrice: 300.0,
      regularMarketChangePercent: -1.2,
      volume: 50000000,
      marketCap: 2200000000000,
    },
    {
      symbol: 'GOOGL',
      shortName: 'Alphabet Inc.',
      regularMarketPrice: 120.0,
      regularMarketChangePercent: 0.5,
      volume: 30000000,
      marketCap: 1500000000000,
    },
    {
      symbol: 'TSLA',
      shortName: 'Tesla Inc.',
      regularMarketPrice: 250.0,
      regularMarketChangePercent: 5.0,
      volume: 100000000,
      marketCap: 800000000000,
    },
    {
      symbol: 'AMZN',
      shortName: 'Amazon.com Inc.',
      regularMarketPrice: 180.0,
      regularMarketChangePercent: -0.8,
      volume: 60000000,
      marketCap: 1900000000000,
    },
  ];

  describe('Sort by Name', () => {
    it('should sort stocks by name ascending on first click', () => {
      const sorted = sortStocks(mockStocks, 'name', 'asc');
      
      expect(sorted[0].shortName).toBe('Alphabet Inc.');
      expect(sorted[1].shortName).toBe('Amazon.com Inc.');
      expect(sorted[2].shortName).toBe('Apple Inc.');
      expect(sorted[3].shortName).toBe('Microsoft Corporation');
      expect(sorted[4].shortName).toBe('Tesla Inc.');
    });

    it('should sort stocks by name descending on second click', () => {
      const sorted = sortStocks(mockStocks, 'name', 'desc');
      
      expect(sorted[0].shortName).toBe('Tesla Inc.');
      expect(sorted[1].shortName).toBe('Microsoft Corporation');
      expect(sorted[2].shortName).toBe('Apple Inc.');
      expect(sorted[3].shortName).toBe('Amazon.com Inc.');
      expect(sorted[4].shortName).toBe('Alphabet Inc.');
    });

    it('should handle stocks with missing names gracefully', () => {
      const stocksWithMissing: StockInfo[] = [
        { symbol: 'TEST1', shortName: 'Beta Company' },
        { symbol: 'TEST2' }, // Missing shortName
        { symbol: 'TEST3', shortName: 'Alpha Company' },
      ];

      const sorted = sortStocks(stocksWithMissing, 'name', 'asc');
      
      // Stocks without names should be at the end
      expect(sorted[0].shortName).toBe('Alpha Company');
      expect(sorted[1].shortName).toBe('Beta Company');
      expect(sorted[2].shortName).toBeUndefined();
    });
  });

  describe('Sort by Price', () => {
    it('should sort stocks by price ascending on first click', () => {
      const sorted = sortStocks(mockStocks, 'price', 'asc');
      
      expect(sorted[0].regularMarketPrice).toBe(120.0);
      expect(sorted[1].regularMarketPrice).toBe(150.0);
      expect(sorted[2].regularMarketPrice).toBe(180.0);
      expect(sorted[3].regularMarketPrice).toBe(250.0);
      expect(sorted[4].regularMarketPrice).toBe(300.0);
    });

    it('should sort stocks by price descending on second click', () => {
      const sorted = sortStocks(mockStocks, 'price', 'desc');
      
      expect(sorted[0].regularMarketPrice).toBe(300.0);
      expect(sorted[1].regularMarketPrice).toBe(250.0);
      expect(sorted[2].regularMarketPrice).toBe(180.0);
      expect(sorted[3].regularMarketPrice).toBe(150.0);
      expect(sorted[4].regularMarketPrice).toBe(120.0);
    });

    it('should handle stocks with missing prices gracefully', () => {
      const stocksWithMissing: StockInfo[] = [
        { symbol: 'TEST1', regularMarketPrice: 100 },
        { symbol: 'TEST2' }, // Missing price
        { symbol: 'TEST3', regularMarketPrice: 50 },
      ];

      const sorted = sortStocks(stocksWithMissing, 'price', 'asc');
      
      expect(sorted[0].regularMarketPrice).toBe(50);
      expect(sorted[1].regularMarketPrice).toBe(100);
      expect(sorted[2].regularMarketPrice).toBeUndefined();
    });
  });

  describe('Sort by Percent Change', () => {
    it('should sort stocks by percent change ascending on first click', () => {
      const sorted = sortStocks(mockStocks, 'percentChange', 'asc');
      
      expect(sorted[0].regularMarketChangePercent).toBe(-1.2);
      expect(sorted[1].regularMarketChangePercent).toBe(-0.8);
      expect(sorted[2].regularMarketChangePercent).toBe(0.5);
      expect(sorted[3].regularMarketChangePercent).toBe(2.5);
      expect(sorted[4].regularMarketChangePercent).toBe(5.0);
    });

    it('should sort stocks by percent change descending on second click', () => {
      const sorted = sortStocks(mockStocks, 'percentChange', 'desc');
      
      expect(sorted[0].regularMarketChangePercent).toBe(5.0);
      expect(sorted[1].regularMarketChangePercent).toBe(2.5);
      expect(sorted[2].regularMarketChangePercent).toBe(0.5);
      expect(sorted[3].regularMarketChangePercent).toBe(-0.8);
      expect(sorted[4].regularMarketChangePercent).toBe(-1.2);
    });

    it('should handle negative percent changes correctly', () => {
      const stocksWithNegatives: StockInfo[] = [
        { symbol: 'DOWN1', regularMarketChangePercent: -5.0 },
        { symbol: 'DOWN2', regularMarketChangePercent: -2.0 },
        { symbol: 'UP1', regularMarketChangePercent: 1.0 },
      ];

      const sorted = sortStocks(stocksWithNegatives, 'percentChange', 'asc');
      
      expect(sorted[0].regularMarketChangePercent).toBe(-5.0);
      expect(sorted[1].regularMarketChangePercent).toBe(-2.0);
      expect(sorted[2].regularMarketChangePercent).toBe(1.0);
    });

    it('should handle stocks with missing percent change gracefully', () => {
      const stocksWithMissing: StockInfo[] = [
        { symbol: 'TEST1', regularMarketChangePercent: 2.0 },
        { symbol: 'TEST2' }, // Missing percent change
        { symbol: 'TEST3', regularMarketChangePercent: -1.0 },
      ];

      const sorted = sortStocks(stocksWithMissing, 'percentChange', 'asc');
      
      expect(sorted[0].regularMarketChangePercent).toBe(-1.0);
      expect(sorted[1].regularMarketChangePercent).toBe(2.0);
      expect(sorted[2].regularMarketChangePercent).toBeUndefined();
    });
  });

  describe('Sort by Volume', () => {
    it('should sort stocks by volume ascending on first click', () => {
      const sorted = sortStocks(mockStocks, 'volume', 'asc');
      
      expect(sorted[0].volume).toBe(30000000);
      expect(sorted[1].volume).toBe(50000000);
      expect(sorted[2].volume).toBe(60000000);
      expect(sorted[3].volume).toBe(80000000);
      expect(sorted[4].volume).toBe(100000000);
    });

    it('should sort stocks by volume descending on second click', () => {
      const sorted = sortStocks(mockStocks, 'volume', 'desc');
      
      expect(sorted[0].volume).toBe(100000000);
      expect(sorted[1].volume).toBe(80000000);
      expect(sorted[2].volume).toBe(60000000);
      expect(sorted[3].volume).toBe(50000000);
      expect(sorted[4].volume).toBe(30000000);
    });

    it('should handle large volume numbers correctly', () => {
      const stocksWithLargeVolume: StockInfo[] = [
        { symbol: 'HIGH', volume: 500000000 },
        { symbol: 'LOW', volume: 1000 },
        { symbol: 'MID', volume: 10000000 },
      ];

      const sorted = sortStocks(stocksWithLargeVolume, 'volume', 'asc');
      
      expect(sorted[0].volume).toBe(1000);
      expect(sorted[1].volume).toBe(10000000);
      expect(sorted[2].volume).toBe(500000000);
    });

    it('should handle stocks with missing volume gracefully', () => {
      const stocksWithMissing: StockInfo[] = [
        { symbol: 'TEST1', volume: 5000000 },
        { symbol: 'TEST2' }, // Missing volume
        { symbol: 'TEST3', volume: 1000000 },
      ];

      const sorted = sortStocks(stocksWithMissing, 'volume', 'asc');
      
      expect(sorted[0].volume).toBe(1000000);
      expect(sorted[1].volume).toBe(5000000);
      expect(sorted[2].volume).toBeUndefined();
    });
  });

  describe('Sort by Market Cap', () => {
    it('should sort stocks by market cap ascending on first click', () => {
      const sorted = sortStocks(mockStocks, 'marketCap', 'asc');
      
      expect(sorted[0].marketCap).toBe(800000000000);
      expect(sorted[1].marketCap).toBe(1500000000000);
      expect(sorted[2].marketCap).toBe(1900000000000);
      expect(sorted[3].marketCap).toBe(2200000000000);
      expect(sorted[4].marketCap).toBe(2500000000000);
    });

    it('should sort stocks by market cap descending on second click', () => {
      const sorted = sortStocks(mockStocks, 'marketCap', 'desc');
      
      expect(sorted[0].marketCap).toBe(2500000000000);
      expect(sorted[1].marketCap).toBe(2200000000000);
      expect(sorted[2].marketCap).toBe(1900000000000);
      expect(sorted[3].marketCap).toBe(1500000000000);
      expect(sorted[4].marketCap).toBe(800000000000);
    });

    it('should handle very large market cap values correctly', () => {
      const stocksWithLargeMarketCap: StockInfo[] = [
        { symbol: 'MEGA', marketCap: 3000000000000 }, // 3T
        { symbol: 'SMALL', marketCap: 100000000 }, // 100M
        { symbol: 'MID', marketCap: 50000000000 }, // 50B
      ];

      const sorted = sortStocks(stocksWithLargeMarketCap, 'marketCap', 'asc');
      
      expect(sorted[0].marketCap).toBe(100000000);
      expect(sorted[1].marketCap).toBe(50000000000);
      expect(sorted[2].marketCap).toBe(3000000000000);
    });

    it('should handle stocks with missing market cap gracefully', () => {
      const stocksWithMissing: StockInfo[] = [
        { symbol: 'TEST1', marketCap: 5000000000 },
        { symbol: 'TEST2' }, // Missing market cap
        { symbol: 'TEST3', marketCap: 1000000000 },
      ];

      const sorted = sortStocks(stocksWithMissing, 'marketCap', 'asc');
      
      expect(sorted[0].marketCap).toBe(1000000000);
      expect(sorted[1].marketCap).toBe(5000000000);
      expect(sorted[2].marketCap).toBeUndefined();
    });
  });

  describe('Sort Direction Toggle Logic', () => {
    it('should return asc when clicking a column for the first time', () => {
      const direction = getNextSortDirection(null, 'price', null);
      expect(direction).toBe('asc');
    });

    it('should return desc when clicking the same column a second time', () => {
      const direction = getNextSortDirection('price', 'price', 'asc');
      expect(direction).toBe('desc');
    });

    it('should return null when clicking the same column a third time (clear sort)', () => {
      const direction = getNextSortDirection('price', 'price', 'desc');
      expect(direction).toBeNull();
    });

    it('should return asc when clicking a different column', () => {
      const direction = getNextSortDirection('price', 'volume', 'desc');
      expect(direction).toBe('asc');
    });

    it('should handle switching between multiple columns correctly', () => {
      // Click price -> asc
      let direction = getNextSortDirection(null, 'price', null);
      expect(direction).toBe('asc');

      // Click volume -> asc (switching to new column)
      direction = getNextSortDirection('price', 'volume', 'asc');
      expect(direction).toBe('asc');

      // Click volume again -> desc
      direction = getNextSortDirection('volume', 'volume', 'asc');
      expect(direction).toBe('desc');

      // Click marketCap -> asc (switching to new column)
      direction = getNextSortDirection('volume', 'marketCap', 'desc');
      expect(direction).toBe('asc');
    });
  });

  describe('Stability and Edge Cases', () => {
    it('should maintain original order for equal values when sorting', () => {
      const stocksWithEqualPrices: StockInfo[] = [
        { symbol: 'FIRST', shortName: 'First', regularMarketPrice: 100 },
        { symbol: 'SECOND', shortName: 'Second', regularMarketPrice: 100 },
        { symbol: 'THIRD', shortName: 'Third', regularMarketPrice: 100 },
      ];

      const sorted = sortStocks(stocksWithEqualPrices, 'price', 'asc');
      
      // Should maintain original order for equal values (stable sort)
      expect(sorted[0].symbol).toBe('FIRST');
      expect(sorted[1].symbol).toBe('SECOND');
      expect(sorted[2].symbol).toBe('THIRD');
    });

    it('should handle empty array', () => {
      const sorted = sortStocks([], 'price', 'asc');
      expect(sorted).toEqual([]);
    });

    it('should handle single stock', () => {
      const singleStock: StockInfo[] = [
        { symbol: 'ONLY', regularMarketPrice: 100 }
      ];

      const sorted = sortStocks(singleStock, 'price', 'asc');
      expect(sorted.length).toBe(1);
      expect(sorted[0].symbol).toBe('ONLY');
    });

    it('should handle all stocks with missing sort field', () => {
      const stocksAllMissing: StockInfo[] = [
        { symbol: 'TEST1', shortName: 'Stock 1' },
        { symbol: 'TEST2', shortName: 'Stock 2' },
        { symbol: 'TEST3', shortName: 'Stock 3' },
      ];

      const sorted = sortStocks(stocksAllMissing, 'price', 'asc');
      expect(sorted.length).toBe(3);
    });

    it('should not mutate the original array', () => {
      const original = [...mockStocks];
      const sorted = sortStocks(mockStocks, 'price', 'asc');
      
      // Original array should remain unchanged
      expect(mockStocks).toEqual(original);
      expect(sorted).not.toBe(mockStocks);
    });

    it('should handle zero values correctly', () => {
      const stocksWithZero: StockInfo[] = [
        { symbol: 'ZERO', regularMarketPrice: 0 },
        { symbol: 'POSITIVE', regularMarketPrice: 10 },
        { symbol: 'NEGATIVE', regularMarketChangePercent: -5 },
      ];

      const sorted = sortStocks(stocksWithZero, 'price', 'asc');
      expect(sorted[0].regularMarketPrice).toBe(0);
      expect(sorted[1].regularMarketPrice).toBe(10);
    });
  });

  describe('Case Insensitive Name Sorting', () => {
    it('should sort names case-insensitively', () => {
      const stocksMixedCase: StockInfo[] = [
        { symbol: 'TEST1', shortName: 'apple Inc.' },
        { symbol: 'TEST2', shortName: 'Amazon Corp' },
        { symbol: 'TEST3', shortName: 'ALPHABET' },
        { symbol: 'TEST4', shortName: 'microsoft' },
      ];

      const sorted = sortStocks(stocksMixedCase, 'name', 'asc');
      
      expect(sorted[0].shortName?.toLowerCase()).toBe('alphabet');
      expect(sorted[1].shortName?.toLowerCase()).toBe('amazon corp');
      expect(sorted[2].shortName?.toLowerCase()).toBe('apple inc.');
      expect(sorted[3].shortName?.toLowerCase()).toBe('microsoft');
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle sorting 1000 stocks efficiently', () => {
      const largeDataset: StockInfo[] = Array.from({ length: 1000 }, (_, i) => ({
        symbol: `STOCK${i}`,
        shortName: `Company ${i}`,
        regularMarketPrice: Math.random() * 1000,
        volume: Math.floor(Math.random() * 100000000),
        marketCap: Math.floor(Math.random() * 1000000000000),
      }));

      const startTime = Date.now();
      const sorted = sortStocks(largeDataset, 'price', 'asc');
      const endTime = Date.now();

      expect(sorted.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});