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
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-divider)' }}>
          {hasFilters && (
            <div style={{ 
              marginBottom: '0.75rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontFamily: 'var(--font-serif)',
            }}>
              {filterList.length} filter{filterList.length !== 1 ? 's' : ''} applied
            </div>
          )}
          <button
            onClick={handleResetFilters}
            disabled={!hasFilters}
            className="reset-filters-btn"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: hasFilters ? 'var(--accent)' : 'var(--bg-sunken)',
              color: hasFilters ? 'var(--text-on-accent)' : 'var(--text-muted)',
              border: hasFilters ? '1px solid var(--accent)' : '1px solid var(--border-divider)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
              cursor: hasFilters ? 'pointer' : 'not-allowed',
              transition: 'transform 140ms ease, box-shadow 140ms ease, background-color 120ms ease',
              boxShadow: hasFilters ? 'var(--shadow-panel)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (hasFilters) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasFilters) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-panel)';
                e.currentTarget.style.backgroundColor = 'var(--accent)';
              }
            }}
          >
            Reset All Filters
          </button>
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
