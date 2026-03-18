import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const High52Filter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = useCallback((prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  }, [filterDict, removeFilter]);

  const [minHigh52, setMinHigh52] = useState<number | null>(null);
  const [maxHigh52, setMaxHigh52] = useState<number | null>(null);
  const prevMinRef = useRef<number | null>(null);
  const prevMaxRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  const showWarning =
    minHigh52 !== null && maxHigh52 !== null && minHigh52 > maxHigh52;

  useEffect(() => {
    isSyncingRef.current = true;
    const minKey = Object.keys(filterDict).find((key) =>
      key.startsWith('high52__greater_than_or_equal')
    );
    const maxKey = Object.keys(filterDict).find((key) =>
      key.startsWith('high52__less_than_or_equal')
    );

    const newMin = minKey && filterDict[minKey].value !== undefined
      ? Number(filterDict[minKey].value)
      : null;
    const newMax = maxKey && filterDict[maxKey].value !== undefined
      ? Number(filterDict[maxKey].value)
      : null;

    if (newMin !== prevMinRef.current) {
      setMinHigh52(newMin);
      prevMinRef.current = newMin;
    }
    if (newMax !== prevMaxRef.current) {
      setMaxHigh52(newMax);
      prevMaxRef.current = newMax;
    }
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [filterDict]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (minHigh52 !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'high52',
        filter_type: 'numeric',
        value: minHigh52,
      });
    } else {
      removeAllWithPrefix('high52__greater_than_or_equal');
    }
  }, [minHigh52, addFilter, removeAllWithPrefix]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (maxHigh52 !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'high52',
        filter_type: 'numeric',
        value: maxHigh52,
      });
    } else {
      removeAllWithPrefix('high52__less_than_or_equal');
    }
  }, [maxHigh52, addFilter, removeAllWithPrefix]);

  return (
    <ExpandableSidebarItem title="52W High">
      <div className="filter-block">
        <div className="filter-block-label">52-Week High (USD)</div>
        <div className="filter-row">
          <input
            type="number"
            placeholder="Min"
            value={minHigh52 ?? ''}
            onChange={(e) => setMinHigh52(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxHigh52 ?? ''}
            onChange={(e) => setMaxHigh52(e.target.value ? Number(e.target.value) : null)}
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

export default High52Filter;