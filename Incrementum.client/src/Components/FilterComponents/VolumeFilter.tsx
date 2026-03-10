import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const VolumeFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = useCallback((prefix: string) => {
    Object.keys(filterDict).forEach(key => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  }, [filterDict, removeFilter]);

  const [min_volume, setMinVolume] = useState<number | null>(null);
  const [min_volume_temp, setMinVolumeTemp] = useState<number | null>(null);
  const [max_volume, setMaxVolume] = useState<number | null>(null);
  const [max_volume_temp, setMaxVolumeTemp] = useState<number | null>(null);
  const [scaleLabelMin, setScaleLabelMin] = useState<number>(1);
  const [scaleLabelMax, setScaleLabelMax] = useState<number>(1);
  const isSyncingRef = useRef(false);

  const showWarning = min_volume !== null && max_volume !== null && min_volume > max_volume;

  // Sync state with filterDict changes
  useEffect(() => {
    isSyncingRef.current = true;
    const minKey = Object.keys(filterDict).find(key => key.startsWith('volume__greater_than_or_equal'));
    const maxKey = Object.keys(filterDict).find(key => key.startsWith('volume__less_than_or_equal'));
    
    if (minKey && filterDict[minKey].value !== undefined) {
      const value = Number(filterDict[minKey].value);
      setMinVolume(value);
      // Auto-scale the display
      if (value >= 1000000) {
        setScaleLabelMin(1000000);
        setMinVolumeTemp(value / 1000000);
      } else if (value >= 1000) {
        setScaleLabelMin(1000);
        setMinVolumeTemp(value / 1000);
      } else {
        setScaleLabelMin(1);
        setMinVolumeTemp(value);
      }
    } else {
      setMinVolume(null);
      setMinVolumeTemp(null);
      setScaleLabelMin(1);
    }
    
    if (maxKey && filterDict[maxKey].value !== undefined) {
      const value = Number(filterDict[maxKey].value);
      setMaxVolume(value);
      // Auto-scale the display
      if (value >= 1000000) {
        setScaleLabelMax(1000000);
        setMaxVolumeTemp(value / 1000000);
      } else if (value >= 1000) {
        setScaleLabelMax(1000);
        setMaxVolumeTemp(value / 1000);
      } else {
        setScaleLabelMax(1);
        setMaxVolumeTemp(value);
      }
    } else {
      setMaxVolume(null);
      setMaxVolumeTemp(null);
      setScaleLabelMax(1);
    }
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [filterDict]);

  useEffect(() => {
    if (!isSyncingRef.current) {
      setMinVolume(min_volume_temp !== null ? min_volume_temp * scaleLabelMin : null);
      setMaxVolume(max_volume_temp !== null ? max_volume_temp * scaleLabelMax : null);
    }
  }, [min_volume_temp, max_volume_temp, scaleLabelMin, scaleLabelMax]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (min_volume !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'volume',
        filter_type: 'numeric',
        value: min_volume,
      });
    } else {
      removeAllWithPrefix('volume__greater_than_or_equal');
    }
  }, [min_volume, addFilter, removeAllWithPrefix]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (max_volume !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'volume',
        filter_type: 'numeric',
        value: max_volume,
      });
    } else {
      removeAllWithPrefix('volume__less_than_or_equal');
    }
  }, [max_volume, addFilter, removeAllWithPrefix]);

  return (
    <ExpandableSidebarItem title="Volume">
      <div className="filter-block">
        <div className="filter-block-label">Trading Volume</div>

        <div className="filter-row">
          <input
            type="number"
            placeholder="Min"
            value={min_volume_temp ?? ''}
            onChange={e => setMinVolumeTemp(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
          />
          <select
            value={scaleLabelMin}
            onChange={e => setScaleLabelMin(Number(e.target.value))}
            className="sidebar-input filter-input-scale"
          >
            <option value={1}></option>
            <option value={1000}>k</option>
            <option value={1000000}>m</option>
            <option value={1000000000}>b</option>
          </select>
        </div>

        <div className="filter-row">
          <input
            type="number"
            placeholder="Max"
            value={max_volume_temp ?? ''}
            onChange={e => setMaxVolumeTemp(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input filter-input-main"
          />
          <select
            value={scaleLabelMax}
            onChange={e => setScaleLabelMax(Number(e.target.value))}
            className="sidebar-input filter-input-scale"
          >
            <option value={1}></option>
            <option value={1000}>k</option>
            <option value={1000000}>m</option>
            <option value={1000000000}>b</option>
          </select>
        </div>
      </div>
      {showWarning && (
        <div className="filter-warning">
          Warning: Min cannot be greater than Max.
        </div>
      )}
    </ExpandableSidebarItem>
  );
};

export default VolumeFilter;
