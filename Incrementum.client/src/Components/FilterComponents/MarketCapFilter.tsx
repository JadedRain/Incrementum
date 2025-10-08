import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface MarketCapFilterProps {
  marketCapMin: string;
  setMarketCapMin: React.Dispatch<React.SetStateAction<string>>;
  marketCapMax: string;
  setMarketCapMax: React.Dispatch<React.SetStateAction<string>>;
}

const MarketCapFilter: React.FC<MarketCapFilterProps> = ({
  marketCapMin,
  setMarketCapMin,
  marketCapMax,
  setMarketCapMax
}) => {
  return (
    <ExpandableSidebarItem title="Market Cap">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Market Cap</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Min"
            value={marketCapMin}
            onChange={e => setMarketCapMin(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="text"
            placeholder="Max"
            value={marketCapMax}
            onChange={e => setMarketCapMax(e.target.value)}
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

export default MarketCapFilter;