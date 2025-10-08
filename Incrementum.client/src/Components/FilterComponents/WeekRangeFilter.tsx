import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface WeekRangeFilterProps {
  high52Min: string;
  setHigh52Min: React.Dispatch<React.SetStateAction<string>>;
  high52Max: string;
  setHigh52Max: React.Dispatch<React.SetStateAction<string>>;
  low52Min: string;
  setLow52Min: React.Dispatch<React.SetStateAction<string>>;
  low52Max: string;
  setLow52Max: React.Dispatch<React.SetStateAction<string>>;
}

const WeekRangeFilter: React.FC<WeekRangeFilterProps> = ({
  high52Min,
  setHigh52Min,
  high52Max,
  setHigh52Max,
  low52Min,
  setLow52Min,
  low52Max,
  setLow52Max
}) => {
  return (
    <ExpandableSidebarItem title="52-Week Range">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>52-Week High</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Min"
            value={high52Min}
            onChange={e => setHigh52Min(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="text"
            placeholder="Max"
            value={high52Max}
            onChange={e => setHigh52Max(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>52-Week Low</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Min"
            value={low52Min}
            onChange={e => setLow52Min(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="text"
            placeholder="Max"
            value={low52Max}
            onChange={e => setLow52Max(e.target.value)}
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

export default WeekRangeFilter;