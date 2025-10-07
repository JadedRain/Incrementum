import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from './ExpandableSidebarItem';
import { helpSetFilters } from '../utils/filterUtils';
import { useSectorsAndIndustries } from '../hooks/useSectorsAndIndustries';

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

  const [filters, setFilters] = useState<{filter_name: string, value: string}[]>([])

  // Custom screener creation state
  const [screenerNameInput, setScreenerNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const saveCustomScreener = async () => {
    if (!screenerNameInput.trim()) {
      setError('Please enter a screener name');
      return;
    }

    if (!apiKey) {
      setError('You must be logged in to save a screener');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log(apiKey)
      const response = await fetch('http://localhost:8000/custom-screeners/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': apiKey,
        },
        body: JSON.stringify({
          screener_name: screenerNameInput.trim(),
          categorical_filters: filters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Custom screener saved successfully!');
        setScreenerNameInput('');
        console.log('Screener saved:', data);

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save screener');
      }
    } catch (error) {
      console.error('Error saving screener:', error);
      setError('Failed to save screener. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {showCustomScreenerSection && (
          <ExpandableSidebarItem title="Save Custom Screener">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <input
                  type="text"
                  value={screenerNameInput}
                  onChange={(e) => setScreenerNameInput(e.target.value)}
                  placeholder="Enter screener name"
                  className="sidebar-input"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  disabled={saving}
                />
              </div>

              {error && (
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: '#efe',
                  border: '1px solid #cfc',
                  color: '#363',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>
                  {success}
                </div>
              )}

              <button
                onClick={saveCustomScreener}
                disabled={saving || !screenerNameInput.trim()}
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: saving || !screenerNameInput.trim() ? '#ccc' : '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: saving || !screenerNameInput.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {saving ? 'Saving...' : 'Save Screener'}
              </button>

              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                Save the current filters as a custom screener. Filters will be added in future updates.
              </div>
            </div>
          </ExpandableSidebarItem>
        )}

        <ExpandableSidebarItem title="Sector">
          {Object.keys(sectorChecks).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <input
                type="checkbox"
                checked={!!sectorChecks[key]}
                onChange={() => {
                  setSectorChecks(prev => {
                    const next = { ...prev, [key]: !prev[key] };
                    if (onSelectedSectorsChange) {
                      const selected = Object.keys(next).filter(k => next[k]);
                      onSelectedSectorsChange(selected);
                    }
                    return next;
                  });
                }}
              />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Industry">
          {Object.keys(industryChecks).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <input
                type="checkbox"
                checked={!!industryChecks[key]}
                onChange={() => {
                  setIndustryChecks(prev => {
                    const next = { ...prev, [key]: !prev[key] };
                    if (onSelectedIndustriesChange) {
                      const selected = Object.keys(next).filter(k => next[k]);
                      onSelectedIndustriesChange(selected);
                    }
                    return next;
                  });
                }}
              />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Region">
          {Object.keys(regionChecks).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <input type="checkbox" checked={!!regionChecks[key]} onChange={() => setRegionChecks(prev => ({ ...prev, [key]: !prev[key] }))} />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Market">
          {Object.keys(marketChecks).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <input type="checkbox" checked={!!marketChecks[key]} onChange={() => setMarketChecks(prev => ({ ...prev, [key]: !prev[key] }))} />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Stocks Traded Volume">
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 600 }}>Average Volume</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Min"
                value={avgVolumeMin}
                onChange={e => setAvgVolumeMin(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <input
                type="text"
                placeholder="Max"
                value={avgVolumeMax}
                onChange={e => setAvgVolumeMax(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Today's Volume</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Min"
                value={todayVolumeMin}
                onChange={e => setTodayVolumeMin(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <input
                type="text"
                placeholder="Max"
                value={todayVolumeMax}
                onChange={e => setTodayVolumeMax(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="52-Week Range">
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 600 }}>52-Week High</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Min"
                value={high52Min}
                onChange={e => setHigh52Min(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <input
                type="text"
                placeholder="Max"
                value={high52Max}
                onChange={e => setHigh52Max(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>52-Week Low</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Min"
                value={low52Min}
                onChange={e => setLow52Min(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <input
                type="text"
                placeholder="Max"
                value={low52Max}
                onChange={e => setLow52Max(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Share Price">
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 600 }}>Share Price</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Min"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <input
                type="text"
                placeholder="Max"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Market Cap">
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 600 }}>Market Cap</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Min"
                value={marketCapMin}
                onChange={e => setMarketCapMin(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <input
                type="text"
                placeholder="Max"
                value={marketCapMax}
                onChange={e => setMarketCapMax(e.target.value)}
                className="sidebar-input"
                style={{ flex: 1, padding: '0.4rem' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="% Change">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <label style={{ marginRight: '0.5rem' }}>Period:</label>
              <select value={changePeriod} onChange={e => {
                if (onChangePeriod) onChangePeriod(e.target.value as 'daily' | 'weekly' | 'monthly');
              }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ marginRight: '0.5rem' }}>Comparison:</label>
              <select value={localPercentChangeFilter} onChange={e => {
                setLocalPercentChangeFilter(e.target.value);
                if (onPercentChangeFilter) onPercentChangeFilter(e.target.value);
              }}>
                <option value="gt">Greater Than</option>
                <option value="lt">Less Than</option>
                <option value="eq">Equal To</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600 }}>Percent Threshold</label>
              <input
                type="number"
                placeholder="e.g. 2.5"
                value={percentThreshold ?? changePercent}
                onChange={e => {
                  setChangePercent(e.target.value);
                  if (onPercentThresholdChange) onPercentThresholdChange(e.target.value);
                }}
                className="sidebar-input"
                style={{ width: '100%', padding: '0.4rem', marginTop: '0.25rem' }}
              />
            </div>
          </div>
        </ExpandableSidebarItem>
      </nav>
    </aside>
  );
};

export default Sidebar;
