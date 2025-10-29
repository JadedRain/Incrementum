import React, { useState, useEffect } from 'react';
import { helpSetFilters } from '../utils/filterUtils';
import { useSectorsAndIndustries } from '../hooks/useSectorsAndIndustries';
import SectorFilter from './FilterComponents/SectorFilter';
import IndustryFilter from './FilterComponents/IndustryFilter';
import RegionFilter from './FilterComponents/RegionFilter';
import MarketFilter from './FilterComponents/MarketFilter';
import VolumeFilter from './FilterComponents/VolumeFilter';
import WeekRangeFilter from './FilterComponents/WeekRangeFilter';
import SharePriceFilter from './FilterComponents/SharePriceFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import PercentChangeFilter from './FilterComponents/PercentChangeFilter';
import SaveCustomScreener from './FilterComponents/SaveCustomScreener';

interface SidebarProps {
  selectedSectors?: string[];
  onSelectedSectorsChange?: (sectors: string[]) => void;
  selectedIndustries?: string[];
  onSelectedIndustriesChange?: (industries: string[]) => void;
  changePeriod?: 'daily' | 'weekly' | 'monthly';
  onChangePeriod?: (period: 'daily' | 'weekly' | 'monthly') => void;
  showCustomScreenerSection?: boolean;
  apiKey?: string;
}


const Sidebar: React.FC<SidebarProps> = ({
  selectedSectors,
  onSelectedSectorsChange,
  selectedIndustries,
  onSelectedIndustriesChange,
  changePeriod = 'daily',
  onChangePeriod,
  showCustomScreenerSection = false,
  apiKey
}) => {
  
  const { sectorChecks, setSectorChecks, industryChecks, setIndustryChecks } = useSectorsAndIndustries({
    selectedSectors,
    selectedIndustries,
  });
  const [regionChecks, setRegionChecks] = useState<{ [k: string]: boolean }>({
    'Region 1': false,
    'Region 2': false,
    'Region 3': false,
  });
  const [marketChecks, setMarketChecks] = useState<{ [k: string]: boolean }>({
    'Nasdaq': false,
    'NYSE': false,
    'AMEX': false,
  });

  const [filters, setFilters] = useState<{filter_name: string, value: string}[]>([]);

useEffect(() =>{
  setFilters([]);
  if (selectedSectors) {
    helpSetFilters(selectedSectors, 'sector', setFilters);
  }
  if (selectedIndustries) {
    helpSetFilters(selectedIndustries, 'industry', setFilters);
  }              
}, [selectedIndustries, selectedSectors])

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {showCustomScreenerSection && (
          <SaveCustomScreener
            filters={filters}
            apiKey={apiKey}
          />
        )}

        <SectorFilter
          sectorChecks={sectorChecks}
          setSectorChecks={setSectorChecks}
          onSelectedSectorsChange={onSelectedSectorsChange}
        />

        <IndustryFilter
          industryChecks={industryChecks}
          setIndustryChecks={setIndustryChecks}
          onSelectedIndustriesChange={onSelectedIndustriesChange}
        />

        <RegionFilter
          regionChecks={regionChecks}
          setRegionChecks={setRegionChecks}
        />

        <MarketFilter
          marketChecks={marketChecks}
          setMarketChecks={setMarketChecks}
        />

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
