import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';

interface MarketCapFilterProps {
  marketCapMin?: string;
  setMarketCapMin?: React.Dispatch<React.SetStateAction<string>>;
  marketCapMax?: string;
  setMarketCapMax?: React.Dispatch<React.SetStateAction<string>>;
}


const MarketCapFilter: React.FC<MarketCapFilterProps> = () => {
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();

  // Utility to remove all keys with a given prefix
  const removeAllWithPrefix = (prefix: string) => {
    Object.keys(filterDict).forEach(key => {
      if (key.startsWith(prefix)) removeFilter(key);
    });
  };
  const [min_market_cap, setMinMarketCap] = useState<number | null>(null);
  const [min_market_cap_temp, setMinMarketCapTemp] = useState<number | null>(null);
  const [max_market_cap, setMaxMarketCap] = useState<number | null>(null);
  const [max_market_cap_temp, setMaxMarketCapTemp] = useState<number | null>(null);
  const [scaleLabelMin, setScaleLabelMin] = useState<number>(1);
  const [scaleLabelMax, setScaleLabelMax] = useState<number>(1);

  const showWarning = min_market_cap !== null && max_market_cap !== null && min_market_cap > max_market_cap;
  useEffect(() => {
    setMinMarketCap(min_market_cap_temp !== null ? min_market_cap_temp * scaleLabelMin : null);
    setMaxMarketCap(max_market_cap_temp !== null ? max_market_cap_temp * scaleLabelMax : null);
  }, [min_market_cap_temp, max_market_cap_temp, scaleLabelMin, scaleLabelMax]);
  useEffect(() => {
    if (min_market_cap !== null) {
      addFilter({
        operator: 'greater_than_or_equal',
        operand: 'market_cap',
        filter_type: 'numeric',
        value: min_market_cap,
      });
    } else {
      removeAllWithPrefix('market_cap__greater_than_or_equal');
    }
  }, [min_market_cap]);

  useEffect(() => {
    if (max_market_cap !== null) {
      addFilter({
        operator: 'less_than_or_equal',
        operand: 'market_cap',
        filter_type: 'numeric',
        value: max_market_cap,
      });
    } else {
      removeAllWithPrefix('market_cap__less_than_or_equal');
    }
  }, [max_market_cap]);

  useEffect(() => {
    console.log('Current filterDict:', filterDict);
  }, [filterDict]);

  return (
    <ExpandableSidebarItem title="Market Cap">
      <div className="filter-block">
        <div className="filter-block-label">Market Cap</div>

        <div className="filter-row">
          <input
            type="number"
            placeholder="Min"
            value={min_market_cap_temp ?? ''}
            onChange={e => setMinMarketCapTemp(e.target.value ? Number(e.target.value) : null)}
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
            <option value={1000000000000}>t</option>
          </select>
        </div>

        <div className="filter-row">
          <input
            type="number"
            placeholder="Max"
            value={max_market_cap_temp ?? ''}
            onChange={e => setMaxMarketCapTemp(e.target.value ? Number(e.target.value) : null)}
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
            <option value={1000000000000}>t</option>
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

export default MarketCapFilter;