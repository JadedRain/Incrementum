import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const PriceFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = useCallback((prefix: string) => {
    Object.keys(filterDict).forEach(key => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  }, [filterDict, removeFilter]);

  const [min_price, setMinPrice] = useState<number | null>(null);
  const [max_price, setMaxPrice] = useState<number | null>(null);
  const prevMinRef = useRef<number | null>(null);
  const prevMaxRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  const showWarning = min_price !== null && max_price !== null && min_price > max_price;

  // Sync state with filterDict changes
  useEffect(() => {
    isSyncingRef.current = true;
    const minKey = Object.keys(filterDict).find(key => key.startsWith('pps__greater_than_or_equal'));
    const maxKey = Object.keys(filterDict).find(key => key.startsWith('pps__less_than_or_equal'));
    
    const newMinPrice = minKey && filterDict[minKey].value !== undefined ? Number(filterDict[minKey].value) : null;
    const newMaxPrice = maxKey && filterDict[maxKey].value !== undefined ? Number(filterDict[maxKey].value) : null;
    
    if (newMinPrice !== prevMinRef.current) {
      setMinPrice(newMinPrice);
      prevMinRef.current = newMinPrice;
    }
    if (newMaxPrice !== prevMaxRef.current) {
      setMaxPrice(newMaxPrice);
      prevMaxRef.current = newMaxPrice;
    }
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [filterDict]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (min_price !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'pps',
        filter_type: 'numeric',
        value: min_price,
      });
    } else {
      removeAllWithPrefix('pps__greater_than_or_equal');
    }
  }, [min_price, addFilter, removeAllWithPrefix]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (max_price !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'pps',
        filter_type: 'numeric',
        value: max_price,
      });
    } else {
      removeAllWithPrefix('pps__less_than_or_equal');
    }
  }, [max_price, addFilter, removeAllWithPrefix]);

  return (
    <ExpandableSidebarItem title="Price">
      <div className="filter-block">
        <div className="filter-block-label">Stock Price (USD)</div>
        <div className="filter-row">
          <input
            type="number"
            placeholder="Min"
            value={min_price ?? ''}
            onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max"
            value={max_price ?? ''}
            onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.01"
          />
        </div>
      </div>
      {showWarning && (
        <div className="filter-warning">
          Warning: Min cannot be greater than Max.
        </div>
      )}
    </ExpandableSidebarItem>
  );
};

export default PriceFilter;
