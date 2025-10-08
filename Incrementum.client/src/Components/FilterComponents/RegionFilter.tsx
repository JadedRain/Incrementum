import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface RegionFilterProps {
  regionChecks: { [k: string]: boolean };
  setRegionChecks: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
}

const RegionFilter: React.FC<RegionFilterProps> = ({
  regionChecks,
  setRegionChecks
}) => {
  return (
    <ExpandableSidebarItem title="Region">
      {Object.keys(regionChecks).map((key) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
          <input type="checkbox" checked={!!regionChecks[key]} onChange={() => setRegionChecks(prev => ({ ...prev, [key]: !prev[key] }))} />
          <span>{key}</span>
        </label>
      ))}
    </ExpandableSidebarItem>
  );
};

export default RegionFilter;