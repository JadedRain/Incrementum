import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface VolumeFilterProps {
  avgVolumeMin: string;
  setAvgVolumeMin: React.Dispatch<React.SetStateAction<string>>;
  avgVolumeMax: string;
  setAvgVolumeMax: React.Dispatch<React.SetStateAction<string>>;
  todayVolumeMin: string;
  setTodayVolumeMin: React.Dispatch<React.SetStateAction<string>>;
  todayVolumeMax: string;
  setTodayVolumeMax: React.Dispatch<React.SetStateAction<string>>;
}

const VolumeFilter: React.FC<VolumeFilterProps> = ({
  avgVolumeMin,
  setAvgVolumeMin,
  avgVolumeMax,
  setAvgVolumeMax,
  todayVolumeMin,
  setTodayVolumeMin,
  todayVolumeMax,
  setTodayVolumeMax
}) => {
  return (
    <ExpandableSidebarItem title="Stocks Traded Volume">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Average Volume</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Min"
            value={avgVolumeMin}
            onChange={e => setAvgVolumeMin(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="text"
            placeholder="Max"
            value={avgVolumeMax}
            onChange={e => setAvgVolumeMax(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>Today's Volume</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Min"
            value={todayVolumeMin}
            onChange={e => setTodayVolumeMin(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="text"
            placeholder="Max"
            value={todayVolumeMax}
            onChange={e => setTodayVolumeMax(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (No filtering functionality implemented; inputs are for UI only.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default VolumeFilter;