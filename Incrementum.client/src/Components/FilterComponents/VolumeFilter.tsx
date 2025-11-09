import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useFilterData } from '../../Context/FilterDataContext';


const VolumeFilter: React.FC = () => {
  const { addFilter, removeFilter, fetchInit } = useFilterData();
  const initNow = fetchInit("nowvolume") ?? {min: null, max: null}
  const [todayMin, setTodayMin] = useState<number | null>(initNow.min);
  const [todayMax, setTodayMax] = useState<number | null>(initNow.max);
  const todaykey = 'dayvolume';
  const todayMinKey = 'todayvolume.min';
  const todayMaxKey = 'todayvolume.max';

  const showTodayWarning = todayMin !== null && todayMax !== null && todayMin > todayMax;

  useEffect(() => {
    if (todayMin !== null) addFilter(todayMinKey, { operand: todaykey, operator: 'gte', filter_type: 'numeric', value_high: null, value_low: null, value: todayMin });
    else removeFilter(todayMinKey);
  }, [todayMin, addFilter, removeFilter]);

  useEffect(() => {
    if (todayMax !== null) addFilter(todayMaxKey, { operand: todaykey, operator: 'lte', filter_type: 'numeric', value_high: null, value_low: null, value: todayMax });
    else removeFilter(todayMaxKey);
  }, [todayMax, addFilter, removeFilter]);

  return (
    <ExpandableSidebarItem title="Stocks Traded Volume">
      <div>
        <div style={{ fontWeight: 600 }}>Today's Volume</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={todayMin ?? ''}
            onChange={e => setTodayMin(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={todayMax ?? ''}
            onChange={e => setTodayMax(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      {showTodayWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: Today's Volume Min cannot be greater than Max.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (Min filter uses &gt;=, Max filter uses &lt;=. Empty inputs remove the filter.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default VolumeFilter;