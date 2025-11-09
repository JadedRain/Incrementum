import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useFilterData } from '../../Context/FilterDataContext';

const WeekRangeFilter: React.FC = () => {
  const { addFilter, removeFilter, fetchInit } = useFilterData();
  const initHigh = fetchInit("weekhigh") ?? {min: null, max: null}
  const initLow = fetchInit("weeklow") ?? {min: null, max: null}
  const [highMin, setHighMin] = useState<number | null>(initHigh.min);
  const [highMax, setHighMax] = useState<number | null>(initHigh.max);
  const [lowMin, setLowMin] = useState<number | null>(initLow.min);
  const [lowMax, setLowMax] = useState<number | null>(initLow.max);

  const highMinKey = 'lastclose52weekhigh.lasttwelvemonths';
  const highMaxKey = 'lastclose52weekhigh.lasttwelvemonths';
  const lowMinKey = 'lastclose52weeklow.lasttwelvemonths';
  const lowMaxKey = 'lastclose52weeklow.lasttwelvemonths';
  const showHighWarning = highMin !== null && highMax !== null && highMin > highMax;
  const showLowWarning = lowMin !== null && lowMax !== null && lowMin > lowMax;

  useEffect(() => {
    if (highMin !== null) addFilter(highMinKey, { operand: highMinKey, operator: 'gte', filter_type: 'numeric', value_high: null, value_low: null, value: highMin });
    else removeFilter(highMinKey);
  }, [highMin, addFilter, removeFilter]);

  useEffect(() => {
    if (highMax !== null) addFilter(highMaxKey, { operand: highMaxKey, operator: 'lte', filter_type: 'numeric', value_high: null, value_low: null, value: highMax });
    else removeFilter(highMaxKey);
  }, [highMax, addFilter, removeFilter]);

  useEffect(() => {
    if (lowMin !== null) addFilter(lowMinKey, { operand: lowMinKey, operator: 'gte', filter_type: 'numeric', value_high: null, value_low: null, value: lowMin });
    else removeFilter(lowMinKey);
  }, [lowMin, addFilter, removeFilter]);

  useEffect(() => {
    if (lowMax !== null) addFilter(lowMaxKey, { operand: lowMaxKey, operator: 'lte', filter_type: 'numeric', value_high: null, value_low: null, value: lowMax });
    else removeFilter(lowMaxKey);
  }, [lowMax, addFilter, removeFilter]);

  return (
    <ExpandableSidebarItem title="52-Week Range">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>52-Week High</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={highMin ?? ''}
            onChange={e => setHighMin(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={highMax ?? ''}
            onChange={e => setHighMax(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>52-Week Low</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min"
            value={lowMin ?? ''}
            onChange={e => setLowMin(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={lowMax ?? ''}
            onChange={e => setLowMax(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem' }}
          />
        </div>
      </div>
      {showHighWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: 52-week High Min cannot be greater than Max.
        </div>
      )}
      {showLowWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: 52-week Low Min cannot be greater than Max.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (Min filter uses &gt;=, Max filter uses &lt;=. Empty inputs remove the filter.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default WeekRangeFilter;