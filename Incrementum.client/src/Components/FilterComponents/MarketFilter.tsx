import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface MarketFilterProps {
  marketChecks: { [k: string]: boolean };
  setMarketChecks: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
}

const MarketFilter: React.FC<MarketFilterProps> = ({
  marketChecks,
  setMarketChecks
}) => {
  return (
    <ExpandableSidebarItem title="Market">
      {Object.keys(marketChecks).map((key) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
          <input type="checkbox" checked={!!marketChecks[key]} onChange={() => setMarketChecks(prev => ({ ...prev, [key]: !prev[key] }))} />
          <span>{key}</span>
        </label>
      ))}
    </ExpandableSidebarItem>
  );
};

export default MarketFilter;