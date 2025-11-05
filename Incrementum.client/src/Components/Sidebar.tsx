import React, { useEffect, useState } from 'react';
import Keywords from './FilterComponents/Keywords';
import SectorFilter from './FilterComponents/Sectors';
import VolumeFilter from './FilterComponents/VolumeFilter';
import WeekRangeFilter from './FilterComponents/WeekRangeFilter';
import SharePriceFilter from './FilterComponents/SharePriceFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import PercentChangeFilter from './FilterComponents/PercentChangeFilter';
import RegionFilter from './FilterComponents/RegionFilter';
import { useFilterData } from '../Context/FilterDataContext';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';


const Sidebar: React.FC = () => {
  // Save screener results -> custom collection UI
  const { stocks } = useFilterData();
  const auth = useAuth();
  const apiKey = auth?.apiKey;
  const navigate = useNavigate();
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  useEffect(() => {
    // load collections from localStorage for client-side demo
    try {
      const cols = JSON.parse(localStorage.getItem('customCollections') || '[]');
      setCollections(cols.map((c: any) => c.name));
    } catch (e) {
      setCollections([]);
    }
  }, []);

  const onSaveToCollection = async () => {
    const symbols = (stocks || []).map((s: any) => s.symbol).filter(Boolean);
    if (!symbols.length) {
      alert('No stocks to save. Run the screener to get results first.');
      return;
    }
    if (selectedCollection === 'new') {
      // navigate to create page and pass selected stocks
      navigate('/create-custom-collection', { state: { selectedStocks: symbols } });
      return;
    }
    if (!selectedCollection) {
      alert('Please select a collection or choose Create New.');
      return;
    }

    try {
        const res = await fetch('/custom-collection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-User-Id': apiKey } : {}),
        },
        body: JSON.stringify({ collection: selectedCollection, symbols }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    } catch (err: any) {
      console.error('Save to collection error', err);
    }
  };

  return (
    <aside className="sidebar">
      <Keywords />
      <div className="sidebar-section p-2">
        <label className="block text-sm font-medium mb-1">Save screener results</label>
        <div className="flex space-x-2">
          <select className="w-full p-1 border rounded" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}>
            <option value="">-- Select collection --</option>
            {collections.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="new">Create new collection...</option>
          </select>
          <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={onSaveToCollection}>Save</button>
        </div>
      </div>
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
