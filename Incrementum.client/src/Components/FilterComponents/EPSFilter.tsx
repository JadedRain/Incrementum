import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const EPSFilter: React.FC = () => {
  const { addFilter, removeFilter } = useDatabaseScreenerContext();
  const [min_eps, setMinEPS] = useState<number | null>(null);
  const [max_eps, setMaxEPS] = useState<number | null>(null);
  const minKey = 'eps__greater_than_or_equal';
  const maxKey = 'eps__less_than_or_equal';

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
      removeFilter(minKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      removeFilter(maxKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max_eps]);

  return (
    <ExpandableSidebarItem title="EPS">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Earnings Per Share (EPS)</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            width: "100%",
            boxSizing: "border-box",
          }}>
          <input
            type="number"
            placeholder="Min"
            value={min_eps ?? ''}
            onChange={e => setMinEPS(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem', minWidth: 0 }}
          />
          <input
            type="number"
            placeholder="Max"
            value={max_eps ?? ''}
            onChange={e => setMaxEPS(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem', minWidth: 0 }}
          />
        </div>
      </div>
      {showWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: Min cannot be greater than Max.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (Min filter uses &gt;=, Max filter uses &lt;=. Empty inputs remove the filter.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default EPSFilter;
