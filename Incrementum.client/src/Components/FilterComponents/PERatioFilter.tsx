import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const PERatioFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };

  const [minPE, setMinPE] = useState<number | null>(null);
  const [maxPE, setMaxPE] = useState<number | null>(null);

  const showWarning = minPE !== null && maxPE !== null && minPE > maxPE;

  useEffect(() => {
    const peKeys = Object.keys(filterDict).filter((key) =>
      key.startsWith('price_per_earnings__')
    );
    if (peKeys.length === 0) {
      setMinPE(null);
      setMaxPE(null);
    }
  }, [filterDict]);

  useEffect(() => {
    if (minPE !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'price_per_earnings',
        filter_type: 'numeric',
        value: minPE,
      });
    } else {
      removeAllWithPrefix('price_per_earnings__greater_than_or_equal');
    }
  }, [minPE]);

  useEffect(() => {
    if (maxPE !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'price_per_earnings',
        filter_type: 'numeric',
        value: maxPE,
      });
    } else {
      removeAllWithPrefix('price_per_earnings__less_than_or_equal');
    }
  }, [maxPE]);

  return (
    <ExpandableSidebarItem title="P/E Ratio">
      <div className="filter-block">
        <div className="filter-block-label">Price-to-Earnings (P/E)</div>
        <div className="filter-row">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={minPE ?? ''}
            onChange={(e) =>
              setMinPE(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxPE ?? ''}
            onChange={(e) =>
              setMaxPE(e.target.value ? Number(e.target.value) : null)
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

export default PERatioFilter;