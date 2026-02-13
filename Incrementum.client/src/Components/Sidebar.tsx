import React from 'react';
import TickerSymbolFilter from './FilterComponents/TickerSymbolFilter';
import IndustryFilter from './FilterComponents/IndustryFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import EPSFilter from './FilterComponents/EPSFilter';
import { useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';

interface SidebarProps {
  screenerName?: string;
  onShowToast?: (message: string) => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const { clearFilters, filterList } = useDatabaseScreenerContext();
  const hasFilters = filterList.length > 0;

  const handleResetFilters = () => {
    clearFilters();
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <button
            onClick={handleResetFilters}
            disabled={!hasFilters}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: hasFilters ? 'hsl(40,62%,26%)' : 'hsl(40,20%,80%)',
              color: hasFilters ? 'hsl(40,65%,74%)' : 'hsl(40,10%,50%)',
              border: hasFilters ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(0,0,0,0.05)',
              borderRadius: '0.125rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: '"Newsreader", serif',
              cursor: hasFilters ? 'pointer' : 'not-allowed',
              transition: 'transform 140ms ease, box-shadow 140ms ease, background-color 120ms ease',
              boxShadow: hasFilters ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (hasFilters) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.28)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasFilters) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.18)';
              }
            }}
          >
            Reset All Filters
          </button>
          {hasFilters && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.75rem', 
              color: 'hsl(40,15%,40%)',
              textAlign: 'center',
              fontFamily: '"Newsreader", serif',
            }}>
              {filterList.length} filter{filterList.length !== 1 ? 's' : ''} active
            </div>
          )}
        </div>

        <TickerSymbolFilter />

        <IndustryFilter />

        <MarketCapFilter />

        <EPSFilter />
      </nav>
    </aside>
  );
};

export default Sidebar;
