import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const PercentChangeFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = useCallback((prefix: string) => {
    Object.keys(filterDict).forEach(key => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  }, [filterDict, removeFilter]);

  const [min_percent, setMinPercent] = useState<number | null>(null);
  const [max_percent, setMaxPercent] = useState<number | null>(null);
  const prevMinRef = useRef<number | null>(null);
  const prevMaxRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  const showWarning = min_percent !== null && max_percent !== null && min_percent > max_percent;

  // Sync state with filterDict changes
  useEffect(() => {
    isSyncingRef.current = true;
    const minKey = Object.keys(filterDict).find(key => key.startsWith('percent_change__greater_than_or_equal'));
    const maxKey = Object.keys(filterDict).find(key => key.startsWith('percent_change__less_than_or_equal'));
    
    const newMinPercent = minKey && filterDict[minKey].value !== undefined ? Number(filterDict[minKey].value) : null;
    const newMaxPercent = maxKey && filterDict[maxKey].value !== undefined ? Number(filterDict[maxKey].value) : null;
    
    if (newMinPercent !== prevMinRef.current) {
      setMinPercent(newMinPercent);
      prevMinRef.current = newMinPercent;
    }
    if (newMaxPercent !== prevMaxRef.current) {
      setMaxPercent(newMaxPercent);
      prevMaxRef.current = newMaxPercent;
    }
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [filterDict]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (min_percent !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'percent_change',
        filter_type: 'numeric',
        value: min_percent,
      });
    } else {
      removeAllWithPrefix('percent_change__greater_than_or_equal');
    }
  }, [min_percent, addFilter, removeAllWithPrefix]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (max_percent !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'percent_change',
        filter_type: 'numeric',
        value: max_percent,
      });
    } else {
      removeAllWithPrefix('percent_change__less_than_or_equal');
    }
  }, [max_percent, addFilter, removeAllWithPrefix]);

  return (
    <ExpandableSidebarItem title="% Change">
      <div className="filter-block">
        <div className="filter-block-label">Daily Percent Change (%)</div>
        <div className="filter-row">
          <input
            type="number"
            placeholder="Min %"
            value={min_percent ?? ''}
            onChange={e => setMinPercent(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.1"
          />
          <input
            type="number"
            placeholder="Max %"
            value={max_percent ?? ''}
            onChange={e => setMaxPercent(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.1"
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

export default PercentChangeFilter;
