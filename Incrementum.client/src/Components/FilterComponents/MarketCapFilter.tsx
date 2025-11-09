import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useFilterData } from '../../Context/FilterDataContext';
import type { FilterData } from '../../Context/FilterDataContext';

interface MarketCapFilterProps {
  marketCapMin?: string;
  setMarketCapMin?: React.Dispatch<React.SetStateAction<string>>;
  marketCapMax?: string;
  setMarketCapMax?: React.Dispatch<React.SetStateAction<string>>;
}

const MarketCapFilter: React.FC<MarketCapFilterProps> = (_props) => {
  const { addFilter, removeFilter, fetchInit, initDict } = useFilterData();
    const [minValue, setMinValue] = useState<number | null>(null);
    const [maxValue, setMaxValue] = useState<number | null>(null);

        useEffect(() => {
        console.log(initDict)
        const init = fetchInit("MarketCapFilter");
        console.log(init)
        if (init) {
          setMinValue(init.high ?? null);
          setMaxValue(init.low ?? null);
        }
      }, [initDict]);

  const minKey = 'marketcap.min';
  const maxKey = 'marketcap.max';
  const keykey = "lastclosemarketcap.lasttwelvemonths"
  const showWarning = minValue !== null && maxValue !== null && minValue > maxValue;

  useEffect(() => {
    if (minValue !== null) {
      const f: FilterData = {
        operand: keykey,
        operator: 'gt',
        filter_type: 'numeric',
        value_high: null,
        value_low: null,
        value: minValue,
      };
      addFilter(minKey, f);
    } else {
      removeFilter(minKey);
    }
  }, [minValue, addFilter, removeFilter]);

  useEffect(() => {
    if (maxValue !== null) {
      const f: FilterData = {
        operand: keykey,
        operator: 'lt',
        filter_type: 'numeric',
        value_high: null,
        value_low: null,
        value: maxValue,
      };
      addFilter(maxKey, f);
    } else {
      removeFilter(maxKey);
    }
  }, [maxValue, addFilter, removeFilter]);

  return (
    <ExpandableSidebarItem title="Market Cap">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Market Cap</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={minValue ?? ''}
            onChange={e => setMinValue(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxValue ?? ''}
            onChange={e => setMaxValue(e.target.value ? Number(e.target.value) : null)}
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

export default MarketCapFilter;