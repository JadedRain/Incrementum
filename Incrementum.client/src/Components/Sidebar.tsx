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
import { useNavigate, useParams } from 'react-router-dom';

interface SidebarProps {
  screenerName?: string;
  screenerInWatchlist?: boolean;
  pendingScreener?: boolean;
  onToggleScreenerWatchlist?: () => void;
  onShowToast?: (message: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  screenerName: screenerNameProp, 
  screenerInWatchlist, 
  pendingScreener,
  onToggleScreenerWatchlist,
  onShowToast
}) => {
  // Save screener results -> custom collection UI
  const { stocks, filterDataDict } = useFilterData();
  const auth = useAuth();
  const apiKey = auth?.apiKey;
  const navigate = useNavigate();
  const { id: screenerId } = useParams<{ id: string }>();
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [savingScreener, setSavingScreener] = useState(false);
  const [screenerName, setScreenerName] = useState<string>('');
  const [screenerError, setScreenerError] = useState<string>('');

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
      if (onShowToast) {
        onShowToast('No stocks to save. Run the screener to get results first.');
      } else {
        alert('No stocks to save. Run the screener to get results first.');
      }
      return;
    }
    if (selectedCollection === 'new') {
      // navigate to create page and pass selected stocks
      navigate('/create-custom-collection', { state: { selectedStocks: symbols } });
      return;
    }
    if (!selectedCollection) {
      if (onShowToast) {
        onShowToast('Please select a collection or choose Create New.');
      } else {
        alert('Please select a collection or choose Create New.');
      }
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
      
      // Show success toast
      if (onShowToast) {
        onShowToast(`Successfully saved ${symbols.length} stock${symbols.length > 1 ? 's' : ''} to ${selectedCollection}`);
      }
    } catch (err: any) {
      console.error('Save to collection error', err);
      if (onShowToast) {
        onShowToast('Failed to save to collection. Please try again.');
      }
    }
  };

  const onSaveScreener = async () => {
    if (!apiKey) {
      setScreenerError('You must be logged in to save a screener.');
      return;
    }

    // If we're updating an existing screener, we don't need a name
    const isUpdate = screenerId && !isNaN(Number(screenerId));
    
    if (!isUpdate && (!screenerName || !screenerName.trim())) {
      setScreenerError('Please enter a screener name.');
      return;
    }

    // Convert filterDataDict to arrays of numeric and categorical filters
    const filters = Object.values(filterDataDict);
    const numeric_filters = filters.filter(f => f.filter_type === 'numeric');
    const categorical_filters = filters.filter(f => f.filter_type === 'categoric');

    if (categorical_filters.length === 0) {
      setScreenerError('You need at least one categorical filter (e.g., sector, region).');
      return;
    }

    setScreenerError(''); // Clear any previous errors
    setSavingScreener(true);
    
    try {
      let response;
      
      if (isUpdate) {
        // Update existing screener
        response = await fetch(`http://localhost:8000/screeners/custom/${screenerId}/update/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': apiKey,
          },
          body: JSON.stringify({
            numeric_filters: numeric_filters,
            categorical_filters: categorical_filters
          })
        });
      } else {
        // Create new screener
        response = await fetch('http://localhost:8000/custom-screeners/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': apiKey,
          },
          body: JSON.stringify({
            name: screenerName.trim(),
            numeric_filters: numeric_filters,
            categorical_filters: categorical_filters
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (isUpdate) {
          alert('Screener updated successfully!');
        } else {
          alert(`Screener "${screenerName}" saved successfully!`);
          setScreenerName(''); // Clear the input after successful save
          // Navigate to the newly created screener
          navigate(`/screener/${data.id}`);
        }
      } else {
        const errorData = await response.json();
        setScreenerError(errorData.error || 'Failed to save screener');
      }
    } catch (error) {
      console.error('Error saving screener:', error);
      setScreenerError('Failed to save screener. Please try again.');
    } finally {
      setSavingScreener(false);
    }
  };

  return (
    <aside className="sidebar">
      <Keywords />
      {/* Watchlist button for the screener */}
      {onToggleScreenerWatchlist && (
        <div className="mb-4 pb-4 border-b-2" style={{ borderBottomColor: 'rgba(0, 0, 0, 0.1)' }}>
          {screenerNameProp && (
            <h3 className="text-lg font-semibold mb-2 text-[hsl(40,62%,18%)]">
              {screenerNameProp}
            </h3>
          )}
          <button
            className={`w-full px-4 py-2 text-sm rounded transition-colors ${
              pendingScreener
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : screenerInWatchlist
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            onClick={onToggleScreenerWatchlist}
            disabled={pendingScreener || !screenerNameProp}
          >
            {pendingScreener 
              ? 'Loading...' 
              : screenerInWatchlist 
              ? 'Remove from Watchlist' 
              : 'Add to Watchlist'}
          </button>
        </div>
      )}
      {apiKey && (
        <div className="sidebar-section p-2">
          <label className="block text-sm font-medium mb-1">
            {screenerId && !isNaN(Number(screenerId)) ? 'Update screener' : 'Save screener'}
          </label>
          {(!screenerId || isNaN(Number(screenerId))) && (
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Enter screener name..."
              value={screenerName}
              onChange={(e) => {
                setScreenerName(e.target.value);
                setScreenerError(''); // Clear error when user types
              }}
            />
          )}
          {screenerError && (
            <div className="text-red-600 text-sm mb-2">
              {screenerError}
            </div>
          )}
          <button 
            className="w-full px-3 py-2 bg-[hsl(40,62%,26%)] text-[hsl(42,56%,76%)] rounded hover:bg-[hsl(40,62%,20%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onSaveScreener}
            disabled={savingScreener}
          >
            {savingScreener 
              ? 'Saving...' 
              : (screenerId && !isNaN(Number(screenerId)) ? 'Update Screener' : 'Save Screener')
            }
          </button>
        </div>
      )}
      {apiKey && (
        <div className="sidebar-section p-2">
          <label className="block text-sm font-medium mb-1">Save screener results to collection</label>
          <div className="flex space-x-2">
            <select className="w-full p-1 border rounded" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}>
              <option value="">-- Select collection --</option>
              {collections.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="new">Create new collection...</option>
            </select>
            <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={onSaveToCollection}>Save</button>
          </div>
        </div>
      )}
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
