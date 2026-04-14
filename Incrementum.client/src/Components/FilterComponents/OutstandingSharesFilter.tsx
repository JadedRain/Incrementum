import React, { useState, useEffect, useCallback } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const OutstandingSharesFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = useCallback((prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  }, [filterDict, removeFilter]);

  const [minOutstandingShares, setMinOutstandingShares] = useState<number | null>(null);
  const [minOutstandingSharesTemp, setMinOutstandingSharesTemp] = useState<number | null>(null);
  const [maxOutstandingShares, setMaxOutstandingShares] = useState<number | null>(null);
  const [maxOutstandingSharesTemp, setMaxOutstandingSharesTemp] = useState<number | null>(null);
  const [scaleLabelMin, setScaleLabelMin] = useState<number>(1);
  const [scaleLabelMax, setScaleLabelMax] = useState<number>(1);

  const showWarning =
    minOutstandingShares !== null &&
    maxOutstandingShares !== null &&
    minOutstandingShares > maxOutstandingShares;

  useEffect(() => {
    const keys = Object.keys(filterDict).filter((key) =>
      key.startsWith('outstanding_shares__')
    );
    if (keys.length === 0) {
      setMinOutstandingShares(null);
      setMaxOutstandingShares(null);
      setMinOutstandingSharesTemp(null);
      setMaxOutstandingSharesTemp(null);
      setScaleLabelMin(1);
      setScaleLabelMax(1);
    }
  }, [filterDict]);

  useEffect(() => {
    setMinOutstandingShares(
      minOutstandingSharesTemp !== null ? minOutstandingSharesTemp * scaleLabelMin : null
    );
    setMaxOutstandingShares(
      maxOutstandingSharesTemp !== null ? maxOutstandingSharesTemp * scaleLabelMax : null
    );
  }, [minOutstandingSharesTemp, maxOutstandingSharesTemp, scaleLabelMin, scaleLabelMax]);

  useEffect(() => {
    if (minOutstandingShares !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'outstanding_shares',
        filter_type: 'numeric',
        value: minOutstandingShares,
      });
    } else {
      removeAllWithPrefix('outstanding_shares__greater_than_or_equal');
    }
  }, [minOutstandingShares, addFilter, removeAllWithPrefix]);

  useEffect(() => {
    if (maxOutstandingShares !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'outstanding_shares',
        filter_type: 'numeric',
        value: maxOutstandingShares,
      });
    } else {
      removeAllWithPrefix('outstanding_shares__less_than_or_equal');
    }
  }, [maxOutstandingShares, addFilter, removeAllWithPrefix]);

  return (
    <ExpandableSidebarItem
      title="Outstanding Shares"
      description="The amount of shares held by shareholders. Used as a component in other metrics."
    >
      <div className="filter-block">
        <div className="filter-block-label">Outstanding Shares</div>

        <div className="filter-row">
          <input
            type="number"
            step="1"
            placeholder="Min"
            value={minOutstandingSharesTemp ?? ''}
            onChange={(e) =>
              setMinOutstandingSharesTemp(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <select
            value={scaleLabelMin}
            onChange={(e) => setScaleLabelMin(Number(e.target.value))}
            className="sidebar-input filter-input-scale"
          >
            <option value={1}></option>
            <option value={1000}>k</option>
            <option value={1000000}>m</option>
            <option value={1000000000}>b</option>
            <option value={1000000000000}>t</option>
          </select>
        </div>

        <div className="filter-row">
          <input
            type="number"
            step="1"
            placeholder="Max"
            value={maxOutstandingSharesTemp ?? ''}
            onChange={(e) =>
              setMaxOutstandingSharesTemp(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <select
            value={scaleLabelMax}
            onChange={(e) => setScaleLabelMax(Number(e.target.value))}
            className="sidebar-input filter-input-scale"
          >
            <option value={1}></option>
            <option value={1000}>k</option>
            <option value={1000000}>m</option>
            <option value={1000000000}>b</option>
            <option value={1000000000000}>t</option>
          </select>
        </div>
      </div>
      {showWarning && (
        <div className="filter-warning">Warning: Min cannot be greater than Max.</div>
      )}
    </ExpandableSidebarItem>
  );
};

export default OutstandingSharesFilter;