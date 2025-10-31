import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useFilterData } from '../../Context/FilterDataContext';
import type { FilterData } from '../../Context/FilterDataContext';

const SharePriceFilter: React.FC = () => {
  const { addFilter, removeFilter } = useFilterData();
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const minKey = 'shareprice.min';
  const maxKey = 'shareprice.max';

  const showWarning = minPrice !== null && maxPrice !== null && minPrice > maxPrice;

  useEffect(() => {
    if (minPrice !== null) {
      const f: FilterData = { operand: minKey, operee: 'gt', type: 'numeric', value_high: null, value_low: null, value: minPrice };
      addFilter(minKey, f);
    } else {
      removeFilter(minKey);
    }
  }, [minPrice, addFilter, removeFilter]);

  useEffect(() => {
    if (maxPrice !== null) {
      const f: FilterData = { operand: maxKey, operee: 'lt', type: 'numeric', value_high: null, value_low: null, value: maxPrice };
      addFilter(maxKey, f);
    } else {
      removeFilter(maxKey);
    }
  }, [maxPrice, addFilter, removeFilter]);

  return (
    <ExpandableSidebarItem title="Share Price">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Share Price</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice ?? ''}
            onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ''}
            onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      {showWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: Min cannot be greater than Max.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (Min filter uses &gt;, Max filter uses &lt;. Empty inputs remove the filter.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default SharePriceFilter;