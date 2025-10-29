import React, { useState, useEffect } from 'react';
import SectorFilter from './FilterComponents/Sectors';
import VolumeFilter from './FilterComponents/VolumeFilter';
import WeekRangeFilter from './FilterComponents/WeekRangeFilter';
import SharePriceFilter from './FilterComponents/SharePriceFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import PercentChangeFilter from './FilterComponents/PercentChangeFilter';

interface SidebarProps {
  changePeriod?: 'daily' | 'weekly' | 'monthly';
  onChangePeriod?: (period: 'daily' | 'weekly' | 'monthly') => void;
  apiKey?: string;
}


const Sidebar: React.FC<SidebarProps> = ({
  changePeriod = 'daily',
  onChangePeriod,
  apiKey
}) => {
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

        <PercentChangeFilter 
          changePeriod = {changePeriod}
          onChangePeriod = {onChangePeriod} 
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
