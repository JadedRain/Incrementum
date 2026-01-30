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
  const [max_market_cap, setMaxMarketCap] = useState<number | null>(null);

  const showWarning = min_market_cap !== null && max_market_cap !== null && min_market_cap > max_market_cap;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max_market_cap]);

  return (
    <ExpandableSidebarItem title="Market Cap">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Market Cap</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            width: "100%",
            boxSizing: "border-box",
          }}>
          <input
            type="number"
            placeholder="Min"
            value={min_market_cap ?? ''}
            onChange={e => setMinMarketCap(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem', minWidth: 0 }}
          />
          <input
            type="number"
            placeholder="Max"
            value={max_market_cap ?? ''}
            onChange={e => setMaxMarketCap(e.target.value ? Number(e.target.value) : null)}
            className="sidebar-input"
            style={{ flex: 1, padding: '0.4rem', minWidth: 0 }}
          />
        </div>
      </div>
      {showWarning && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Warning: Min cannot be greater than Max.
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
        (Min filter uses &gt;=, Max filter uses &lt;=. Empty inputs remove the filter.)
      </div>
    </ExpandableSidebarItem>
  );
};

export default MarketCapFilter;