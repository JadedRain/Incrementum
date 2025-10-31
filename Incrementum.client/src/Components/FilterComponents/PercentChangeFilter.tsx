import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useFilterData } from '../../Context/FilterDataContext';
import type { FilterData } from '../../Context/FilterDataContext';

const PercentChangeFilter: React.FC = () => {
  const { addFilter, removeFilter } = useFilterData();
  const [operator, setOperator] = useState<'gt' | 'lt' | 'eq'>('gt');
  const [changePeriod, _setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [threshold, setThreshold] = useState<number | null>(null);

  const key = `percent_change_${changePeriod}`;

  useEffect(() => {
    ['daily', 'weekly', 'monthly'].forEach((p) => {
      if (p !== changePeriod) removeFilter(`percent_change_${p}`);
    });
    if (threshold !== null) {
      const f: FilterData = {
        operand: key,
        operee: operator,
        type: 'numeric',
        value_high: null,
        value_low: null,
        value: threshold,
      };
      addFilter(key, f);
    } else {
      removeFilter(key);
    }
  }, [changePeriod, operator, threshold, addFilter, removeFilter]);

  return (
    <ExpandableSidebarItem title="% Change">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Period:</label>
          <select value={changePeriod} onChange={e => { const p = e.target.value as 'daily'|'weekly'|'monthly'; if (onChangePeriod) onChangePeriod(p); }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Comparison:</label>
          <select value={operator} onChange={e => setOperator(e.target.value as 'gt'|'lt'|'eq')}>
            <option value="gt">Greater Than</option>
            <option value="lt">Less Than</option>
            <option value="eq">Equal To</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Percent Threshold</label>
          <input
            type="number"
            placeholder="e.g. 2.5"
            value={threshold ?? ''}
            onChange={e => setThreshold(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ width: '100%', padding: '0.4rem', marginTop: '0.25rem' }}
          />
        </div>
      </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
          (Empty input removes the filter. Comparison chooses the operator: Greater Than (gt), Less Than (lt), Equal To (eq).)
        </div>
    </ExpandableSidebarItem>
  );
};

export default PercentChangeFilter;