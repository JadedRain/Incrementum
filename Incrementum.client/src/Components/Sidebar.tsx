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
  percentThreshold?: string;
  onPercentThresholdChange?: (value: string) => void;
  changePeriod?: 'daily' | 'weekly' | 'monthly';
  onChangePeriod?: (period: 'daily' | 'weekly' | 'monthly') => void;
  percentChangeFilter?: string;
  onPercentChangeFilter?: (filter: string) => void;
  showCustomScreenerSection?: boolean;
  apiKey?: string;
}


const Sidebar: React.FC<SidebarProps> = ({
  selectedSectors,
  onSelectedSectorsChange,
  selectedIndustries,
  onSelectedIndustriesChange,
  percentThreshold,
  onPercentThresholdChange,
  changePeriod = 'daily',
  onChangePeriod,
  percentChangeFilter = 'gt',
  onPercentChangeFilter,
  showCustomScreenerSection = false,
  apiKey
}) => {
  // Categoric FIlters
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
  
  // Numeric Filters
  const [avgVolumeMin, setAvgVolumeMin] = useState('');
  const [avgVolumeMax, setAvgVolumeMax] = useState('');
  const [todayVolumeMin, setTodayVolumeMin] = useState('');
  const [todayVolumeMax, setTodayVolumeMax] = useState('');
  const [high52Min, setHigh52Min] = useState('');
  const [high52Max, setHigh52Max] = useState('');
  const [low52Min, setLow52Min] = useState('');
  const [low52Max, setLow52Max] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [localPercentChangeFilter, setLocalPercentChangeFilter] = useState<string>(percentChangeFilter);
  const [changePercent, setChangePercent] = useState('');
  const [marketCapMin, setMarketCapMin] = useState('');
  const [marketCapMax, setMarketCapMax] = useState('');

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


  useEffect(() => {
    setLocalPercentChangeFilter(percentChangeFilter);
  }, [percentChangeFilter]);

  // Sync changePercent with percentThreshold prop
  useEffect(() => {
    if (typeof percentThreshold === 'string') {
      setChangePercent(percentThreshold);
    }
  }, [percentThreshold]);



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

        <VolumeFilter
          avgVolumeMin={avgVolumeMin}
          setAvgVolumeMin={setAvgVolumeMin}
          avgVolumeMax={avgVolumeMax}
          setAvgVolumeMax={setAvgVolumeMax}
          todayVolumeMin={todayVolumeMin}
          setTodayVolumeMin={setTodayVolumeMin}
          todayVolumeMax={todayVolumeMax}
          setTodayVolumeMax={setTodayVolumeMax}
        />

        <WeekRangeFilter
          high52Min={high52Min}
          setHigh52Min={setHigh52Min}
          high52Max={high52Max}
          setHigh52Max={setHigh52Max}
          low52Min={low52Min}
          setLow52Min={setLow52Min}
          low52Max={low52Max}
          setLow52Max={setLow52Max}
        />

        <SharePriceFilter
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
        />

        <MarketCapFilter
          marketCapMin={marketCapMin}
          setMarketCapMin={setMarketCapMin}
          marketCapMax={marketCapMax}
          setMarketCapMax={setMarketCapMax}
        />

        <PercentChangeFilter
          changePeriod={changePeriod}
          onChangePeriod={onChangePeriod}
          localPercentChangeFilter={localPercentChangeFilter}
          setLocalPercentChangeFilter={setLocalPercentChangeFilter}
          onPercentChangeFilter={onPercentChangeFilter}
          percentThreshold={percentThreshold}
          changePercent={changePercent}
          setChangePercent={setChangePercent}
          onPercentThresholdChange={onPercentThresholdChange}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
