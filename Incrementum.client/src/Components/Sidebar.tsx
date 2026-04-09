import React from 'react';
import TickerSymbolFilter from './FilterComponents/TickerSymbolFilter';
import IndustryFilter from './FilterComponents/IndustryFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import EPSFilter from './FilterComponents/EPSFilter';
import DebtToEquityFilter from './FilterComponents/DebtToEquityFilter';
import AnnualEPSGrowthFilter from './FilterComponents/AnnualEPSGrowthFilter';
import PERatioFilter from './FilterComponents/PERatioFilter';
import PEGRatioFilter from './FilterComponents/PEGRatioFilter';
import RevenuePerShareFilter from './FilterComponents/RevenuePerShareFilter';
import PricePerSalesFilter from './FilterComponents/PricePerSalesFilter';
import PriceFilter from './FilterComponents/PriceFilter';
import High52Filter from './FilterComponents/High52Filter';
import Low52Filter from './FilterComponents/Low52Filter';
import VolumeFilter from './FilterComponents/VolumeFilter';
import PercentChangeFilter from './FilterComponents/PercentChangeFilter';
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
        <div className="sidebar-filter-section">
          {hasFilters && (
            <div className="filter-count">
              {filterList.length} filter{filterList.length !== 1 ? 's' : ''} applied
            </div>
          )}
          <button
            onClick={handleResetFilters}
            disabled={!hasFilters}
            className={`reset-filters-btn ${hasFilters ? 'active' : 'inactive'}`}
          >
            Reset All Filters
          </button>
        </div>

        <TickerSymbolFilter />

        <IndustryFilter />

        <PriceFilter />

        <High52Filter />

        <Low52Filter />

        <MarketCapFilter />

        <VolumeFilter />

        <PercentChangeFilter />

        <EPSFilter />

        <DebtToEquityFilter />

        <AnnualEPSGrowthFilter />

        <PERatioFilter />

        <PEGRatioFilter />

        <RevenuePerShareFilter />

        <PricePerSalesFilter />
      </nav>
    </aside>
  );
};

export default Sidebar;
