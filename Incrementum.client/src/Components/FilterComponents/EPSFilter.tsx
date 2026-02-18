import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const EPSFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach(key => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };
  const [min_eps, setMinEPS] = useState<number | null>(null);
  const [max_eps, setMaxEPS] = useState<number | null>(null);

  const showWarning = min_eps !== null && max_eps !== null && min_eps > max_eps;

  useEffect(() => {
    if (min_eps !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'eps',
        filter_type: 'numeric',
        value: min_eps,
      });
    } else {
      removeAllWithPrefix('eps__greater_than_or_equal');
    }
  }, [min_eps]);

  useEffect(() => {
    if (max_eps !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'eps',
        filter_type: 'numeric',
        value: max_eps,
      });
    } else {
      removeAllWithPrefix('eps__less_than_or_equal');
    }
  }, [max_eps]);

  return (
    <ExpandableSidebarItem title="EPS">
      <div className="filter-block">
        <div className="filter-block-label">Earnings Per Share (EPS)</div>
        <div className="filter-row">
          <input
            type="number"
            placeholder="Min"
            value={min_eps ?? ''}
            onChange={e => setMinEPS(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            placeholder="Max"
            value={max_eps ?? ''}
            onChange={e => setMaxEPS(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
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

export default EPSFilter;
