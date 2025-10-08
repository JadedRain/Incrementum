import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface SharePriceFilterProps {
  priceMin: string;
  setPriceMin: React.Dispatch<React.SetStateAction<string>>;
  priceMax: string;
  setPriceMax: React.Dispatch<React.SetStateAction<string>>;
}

const SharePriceFilter: React.FC<SharePriceFilterProps> = ({
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax
}) => {
  return (
    <ExpandableSidebarItem title="Share Price">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Share Price</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="text"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
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

export default SharePriceFilter;