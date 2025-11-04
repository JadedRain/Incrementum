import React from 'react';
import SectorFilter from './FilterComponents/Sectors';
import VolumeFilter from './FilterComponents/VolumeFilter';
import WeekRangeFilter from './FilterComponents/WeekRangeFilter';
import SharePriceFilter from './FilterComponents/SharePriceFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import PercentChangeFilter from './FilterComponents/PercentChangeFilter';
import RegionFilter from './FilterComponents/RegionFilter';

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
        <RegionFilter />
        <SectorFilter />
        
        {/* industry not working */}
        {/* <IndustryFilter /> */}
        
        {/* todayvolume.min not working */}
        {/* avgvolume.min */}
        {/* avgvolume.max */}
        {/* todayvolume.max */}
        <VolumeFilter />
          {/* lastclose52weekhigh.min */}
          {/* lastclose52weekhigh.max  */}
        <WeekRangeFilter />

        <SharePriceFilter />

        <MarketCapFilter /> 

        <PercentChangeFilter />
      </nav>
    </aside>
  );
};

export default Sidebar;
