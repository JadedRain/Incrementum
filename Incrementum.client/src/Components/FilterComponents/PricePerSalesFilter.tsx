import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

const PricePerSalesFilter: React.FC = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach((key) => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };

  const [minPPS, setMinPPS] = useState<number | null>(null);
  const [maxPPS, setMaxPPS] = useState<number | null>(null);

  const showWarning = minPPS !== null && maxPPS !== null && minPPS > maxPPS;

  useEffect(() => {
    const keys = Object.keys(filterDict).filter((key) =>
      key.startsWith('price_per_sales__')
    );
    if (keys.length === 0) {
      setMinPPS(null);
      setMaxPPS(null);
    }
  }, [filterDict]);

  useEffect(() => {
    if (minPPS !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'price_per_sales',
        filter_type: 'numeric',
        value: minPPS,
      });
    } else {
      removeAllWithPrefix('price_per_sales__greater_than_or_equal');
    }
  }, [minPPS]);

  useEffect(() => {
    if (maxPPS !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'price_per_sales',
        filter_type: 'numeric',
        value: maxPPS,
      });
    } else {
      removeAllWithPrefix('price_per_sales__less_than_or_equal');
    }
  }, [maxPPS]);

  return (
    <ExpandableSidebarItem title="P/S Ratio">
      <div className="filter-block">
        <div className="filter-block-label">Price-to-Sales (P/S)</div>
        <div className="filter-row">
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={minPPS ?? ''}
            onChange={(e) =>
              setMinPPS(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxPPS ?? ''}
            onChange={(e) =>
              setMaxPPS(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input filter-input-main"
          />
        </div>
        {showWarning && (
          <div className="filter-warning">Min cannot exceed Max</div>
        )}
      </div>
    </ExpandableSidebarItem>
  );
};

export default PricePerSalesFilter;
