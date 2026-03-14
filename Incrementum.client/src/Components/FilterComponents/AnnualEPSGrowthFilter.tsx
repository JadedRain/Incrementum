import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const AnnualEPSGrowthFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };

  const [minGrowth, setMinGrowth] = useState<number | null>(null);
  const [maxGrowth, setMaxGrowth] = useState<number | null>(null);

  const showWarning =
    minGrowth !== null && maxGrowth !== null && minGrowth > maxGrowth;

  useEffect(() => {
    const growthKeys = Object.keys(filterDict).filter((key) =>
      key.startsWith('annual_eps_growth_rate__')
    );
    if (growthKeys.length === 0) {
      setMinGrowth(null);
      setMaxGrowth(null);
    }
  }, [filterDict]);

  useEffect(() => {
    if (minGrowth !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'annual_eps_growth_rate',
        filter_type: 'numeric',
        value: minGrowth,
      });
    } else {
      removeAllWithPrefix('annual_eps_growth_rate__greater_than_or_equal');
    }
  }, [minGrowth]);

  useEffect(() => {
    if (maxGrowth !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'annual_eps_growth_rate',
        filter_type: 'numeric',
        value: maxGrowth,
      });
    } else {
      removeAllWithPrefix('annual_eps_growth_rate__less_than_or_equal');
    }
  }, [maxGrowth]);

  return (
    <ExpandableSidebarItem title="Annual EPS Growth">
      <div className="filter-block">
        <div className="filter-block-label">Annual EPS Growth (%)</div>
        <div className="filter-row">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={minGrowth ?? ''}
            onChange={(e) =>
              setMinGrowth(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxGrowth ?? ''}
            onChange={(e) =>
              setMaxGrowth(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
        </div>
      </div>
      {showWarning && (
        <div className="filter-warning">Warning: Min cannot be greater than Max.</div>
      )}
    </ExpandableSidebarItem>
  );
};

export default AnnualEPSGrowthFilter;