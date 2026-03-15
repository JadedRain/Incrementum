import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const RevenuePerShareFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };

  const [minRPS, setMinRPS] = useState<number | null>(null);
  const [maxRPS, setMaxRPS] = useState<number | null>(null);

  const showWarning = minRPS !== null && maxRPS !== null && minRPS > maxRPS;

  useEffect(() => {
    const keys = Object.keys(filterDict).filter((key) =>
      key.startsWith('revenue_per_share__')
    );
    if (keys.length === 0) {
      setMinRPS(null);
      setMaxRPS(null);
    }
  }, [filterDict]);

  useEffect(() => {
    if (minRPS !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'revenue_per_share',
        filter_type: 'numeric',
        value: minRPS,
      });
    } else {
      removeAllWithPrefix('revenue_per_share__greater_than_or_equal');
    }
  }, [minRPS]);

  useEffect(() => {
    if (maxRPS !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'revenue_per_share',
        filter_type: 'numeric',
        value: maxRPS,
      });
    } else {
      removeAllWithPrefix('revenue_per_share__less_than_or_equal');
    }
  }, [maxRPS]);

  return (
    <ExpandableSidebarItem title="Revenue/Share">
      <div className="filter-block">
        <div className="filter-block-label">Revenue Per Share ($)</div>
        <div className="filter-row">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={minRPS ?? ''}
            onChange={(e) =>
              setMinRPS(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxRPS ?? ''}
            onChange={(e) =>
              setMaxRPS(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
        </div>
        {showWarning && (
          <div className="filter-warning">Min cannot exceed Max</div>
        )}
      </div>
    </ExpandableSidebarItem>
  );
};

export default RevenuePerShareFilter;
