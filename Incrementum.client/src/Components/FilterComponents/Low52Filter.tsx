import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const Low52Filter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = useCallback((prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  }, [filterDict, removeFilter]);

  const [minLow52, setMinLow52] = useState<number | null>(null);
  const [maxLow52, setMaxLow52] = useState<number | null>(null);
  const prevMinRef = useRef<number | null>(null);
  const prevMaxRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  const showWarning =
    minLow52 !== null && maxLow52 !== null && minLow52 > maxLow52;

  useEffect(() => {
    isSyncingRef.current = true;
    const minKey = Object.keys(filterDict).find((key) =>
      key.startsWith('low52__greater_than_or_equal')
    );
    const maxKey = Object.keys(filterDict).find((key) =>
      key.startsWith('low52__less_than_or_equal')
    );

    const newMin = minKey && filterDict[minKey].value !== undefined
      ? Number(filterDict[minKey].value)
      : null;
    const newMax = maxKey && filterDict[maxKey].value !== undefined
      ? Number(filterDict[maxKey].value)
      : null;

    if (newMin !== prevMinRef.current) {
      setMinLow52(newMin);
      prevMinRef.current = newMin;
    }
    if (newMax !== prevMaxRef.current) {
      setMaxLow52(newMax);
      prevMaxRef.current = newMax;
    }
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [filterDict]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (minLow52 !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'low52',
        filter_type: 'numeric',
        value: minLow52,
      });
    } else {
      removeAllWithPrefix('low52__greater_than_or_equal');
    }
  }, [minLow52, addFilter, removeAllWithPrefix]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (maxLow52 !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'low52',
        filter_type: 'numeric',
        value: maxLow52,
      });
    } else {
      removeAllWithPrefix('low52__less_than_or_equal');
    }
  }, [maxLow52, addFilter, removeAllWithPrefix]);

  return (
    <ExpandableSidebarItem title="52W Low">
      <div className="filter-block">
        <div className="filter-block-label">52-Week Low (USD)</div>
        <div className="filter-row">
          <input
            type="number"
            placeholder="Min"
            value={minLow52 ?? ''}
            onChange={(e) => setMinLow52(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxLow52 ?? ''}
            onChange={(e) => setMaxLow52(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.01"
          />
        </div>
      </div>
      {showWarning && (
        <div className="filter-warning">Warning: Min cannot be greater than Max.</div>
      )}
    </ExpandableSidebarItem>
  );
};

export default Low52Filter;