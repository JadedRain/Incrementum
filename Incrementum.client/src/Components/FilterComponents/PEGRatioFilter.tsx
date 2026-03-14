import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const PEGRatioFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };

  const [minPEG, setMinPEG] = useState<number | null>(null);
  const [maxPEG, setMaxPEG] = useState<number | null>(null);

  const showWarning = minPEG !== null && maxPEG !== null && minPEG > maxPEG;

  useEffect(() => {
    const pegKeys = Object.keys(filterDict).filter((key) =>
      key.startsWith('pe_per_growth__')
    );
    if (pegKeys.length === 0) {
      setMinPEG(null);
      setMaxPEG(null);
    }
  }, [filterDict]);

  useEffect(() => {
    if (minPEG !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'pe_per_growth',
        filter_type: 'numeric',
        value: minPEG,
      });
    } else {
      removeAllWithPrefix('pe_per_growth__greater_than_or_equal');
    }
  }, [minPEG]);

  useEffect(() => {
    if (maxPEG !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'pe_per_growth',
        filter_type: 'numeric',
        value: maxPEG,
      });
    } else {
      removeAllWithPrefix('pe_per_growth__less_than_or_equal');
    }
  }, [maxPEG]);

  return (
    <ExpandableSidebarItem title="PEG Ratio">
      <div className="filter-block">
        <div className="filter-block-label">Price/Earnings-to-Growth (PEG)</div>
        <div className="filter-row">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={minPEG ?? ''}
            onChange={(e) =>
              setMinPEG(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxPEG ?? ''}
            onChange={(e) =>
              setMaxPEG(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
        </div>
      </div>
      {showWarning && (
        <div className="filter-warning">Warning: Min cannot be greater than Max.</div>
      )}
    </ExpandableSidebarItem>
  );
};

export default PEGRatioFilter;