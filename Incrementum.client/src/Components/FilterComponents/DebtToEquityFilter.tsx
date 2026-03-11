import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const DebtToEquityFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach(key => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };
  const [min_debt_to_equity, setMinDebtToEquity] = useState<number | null>(null);
  const [max_debt_to_equity, setMaxDebtToEquity] = useState<number | null>(null);

  const showWarning = min_debt_to_equity !== null && max_debt_to_equity !== null && min_debt_to_equity > max_debt_to_equity;

  // Clear local state when filters are reset
  useEffect(() => {
    const deKeys = Object.keys(filterDict).filter(key => key.startsWith('debt_to_equity__'));
    if (deKeys.length === 0) {
      setMinDebtToEquity(null);
      setMaxDebtToEquity(null);
    }
  }, [filterDict]);

  useEffect(() => {
    if (min_debt_to_equity !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'debt_to_equity',
        filter_type: 'numeric',
        value: min_debt_to_equity,
      });
    } else {
      removeAllWithPrefix('debt_to_equity__greater_than_or_equal');
    }
  }, [min_debt_to_equity]);

  useEffect(() => {
    if (max_debt_to_equity !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'debt_to_equity',
        filter_type: 'numeric',
        value: max_debt_to_equity,
      });
    } else {
      removeAllWithPrefix('debt_to_equity__less_than_or_equal');
    }
  }, [max_debt_to_equity]);

  return (
    <ExpandableSidebarItem title="Debt-to-Equity">
      <div className="filter-block">
        <div className="filter-block-label">Debt-to-Equity Ratio</div>
        <div className="filter-row">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={min_debt_to_equity ?? ''}
            onChange={e => setMinDebtToEquity(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={max_debt_to_equity ?? ''}
            onChange={e => setMaxDebtToEquity(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
          />
        </div>
        <div className="filter-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Lower is better (less debt relative to equity)
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

export default DebtToEquityFilter;
