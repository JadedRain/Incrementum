import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useFilterData } from '../../Context/FilterDataContext';

interface VolumeFilterProps {
  avgVolumeMin?: string;
  setAvgVolumeMin?: React.Dispatch<React.SetStateAction<string>>;
  avgVolumeMax?: string;
  setAvgVolumeMax?: React.Dispatch<React.SetStateAction<string>>;
  todayVolumeMin?: string;
  setTodayVolumeMin?: React.Dispatch<React.SetStateAction<string>>;
  todayVolumeMax?: string;
  setTodayVolumeMax?: React.Dispatch<React.SetStateAction<string>>;
}

const VolumeFilter: React.FC<VolumeFilterProps> = (_props) => {
  const { addFilter, removeFilter } = useFilterData();
  const [avgMin, setAvgMin] = useState<number | null>(null);
  const [avgMax, setAvgMax] = useState<number | null>(null);
  const [todayMin, setTodayMin] = useState<number | null>(null);
  const [todayMax, setTodayMax] = useState<number | null>(null);

  const avgMinKey = 'avgvolume.min';
  const avgMaxKey = 'avgvolume.max';
  const todayMinKey = 'todayvolume.min';
  const todayMaxKey = 'todayvolume.max';

  const showAvgWarning = avgMin !== null && avgMax !== null && avgMin > avgMax;
  const showTodayWarning = todayMin !== null && todayMax !== null && todayMin > todayMax;

  useEffect(() => {
    if (avgMin !== null) addFilter(avgMinKey, { operand: avgMinKey, operee: 'gt', type: 'numeric', value_high: null, value_low: null, value: avgMin });
    else removeFilter(avgMinKey);
  }, [avgMin, addFilter, removeFilter]);

  useEffect(() => {
    if (avgMax !== null) addFilter(avgMaxKey, { operand: avgMaxKey, operee: 'lt', type: 'numeric', value_high: null, value_low: null, value: avgMax });
    else removeFilter(avgMaxKey);
  }, [avgMax, addFilter, removeFilter]);

  useEffect(() => {
    if (todayMin !== null) addFilter(todayMinKey, { operand: todayMinKey, operee: 'gt', type: 'numeric', value_high: null, value_low: null, value: todayMin });
    else removeFilter(todayMinKey);
  }, [todayMin, addFilter, removeFilter]);

  useEffect(() => {
    if (todayMax !== null) addFilter(todayMaxKey, { operand: todayMaxKey, operee: 'lt', type: 'numeric', value_high: null, value_low: null, value: todayMax });
    else removeFilter(todayMaxKey);
  }, [todayMax, addFilter, removeFilter]);

  return (
    <ExpandableSidebarItem title="Stocks Traded Volume">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Average Volume</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={avgMin ?? ''}
            onChange={e => setAvgMin(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={avgMax ?? ''}
            onChange={e => setAvgMax(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
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
      {showAvgWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: Average Volume Min cannot be greater than Max.
        </div>
      )}
      {showTodayWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: Today's Volume Min cannot be greater than Max.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (Min filter uses &gt;, Max filter uses &lt;. Empty inputs remove the filter.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default VolumeFilter;