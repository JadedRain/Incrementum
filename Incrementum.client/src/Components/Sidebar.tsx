import React from 'react';
import SectorFilter from './FilterComponents/Sectors';
import VolumeFilter from './FilterComponents/VolumeFilter';
import WeekRangeFilter from './FilterComponents/WeekRangeFilter';
import SharePriceFilter from './FilterComponents/SharePriceFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import PercentChangeFilter from './FilterComponents/PercentChangeFilter';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* {showCustomScreenerSection && (
          <SaveCustomScreener
            filters={filters}
            apiKey={apiKey}
          />
        )} */}

        <SectorFilter />

        <VolumeFilter />

        <WeekRangeFilter />

        <SharePriceFilter />

        <MarketCapFilter />

        <PercentChangeFilter />
      </nav>
    </aside>
  );
};

export default Sidebar;
