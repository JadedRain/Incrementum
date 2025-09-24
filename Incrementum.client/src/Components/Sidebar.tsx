import React, { useState, useEffect } from 'react';
import ExpandableSidebarItem from './ExpandableSidebarItem';

interface SidebarProps {
  selectedSectors?: string[];
  onSelectedSectorsChange?: (sectors: string[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedSectors = [], onSelectedSectorsChange }) => {
  const [sectorChecks, setSectorChecks] = useState<{[k:string]:boolean}>({});
  const [industryChecks, setIndustryChecks] = useState<{[k:string]:boolean}>({
    'Industry 1': false,
    'Industry 2': false,
    'Industry 3': false,
  });
  const [regionChecks, setRegionChecks] = useState<{[k:string]:boolean}>({
    'Region 1': false,
    'Region 2': false,
    'Region 3': false,
  });
  const [marketChecks, setMarketChecks] = useState<{[k:string]:boolean}>({
    'Nasdaq': false,
    'NYSE': false,
    'AMEX': false,
  });

  useEffect(() => {
    let mounted = true;
    const fetchSectors = async () => {
      try {
        const res = await fetch('/sectors/');
        if (!res.ok) return;
        const data = await res.json();
        const fetched: string[] = Array.isArray(data.sectors) ? data.sectors : [];
        if (!mounted) return;
        // Update checks mapping to include fetched sectors (preserve existing checked state)
        setSectorChecks(prev => {
          const next: {[k:string]:boolean} = {};
          fetched.forEach(s => {
            // If parent passed selectedSectors, use that; otherwise preserve or default to false
            const isSelected = selectedSectors.length ? selectedSectors.includes(s) : !!prev[s];
            next[s] = isSelected;
          });
          // Notify parent of initial selection if provided
          if (onSelectedSectorsChange) {
            const selected = Object.keys(next).filter(k => next[k]);
            onSelectedSectorsChange(selected);
          }
          return next;
        });
      } catch (e) {
        // swallow errors for now; sidebar will remain empty
      }
    };
    fetchSectors();
    return () => { mounted = false; };
  }, []);

  // If parent updates selectedSectors, reflect that in local checks
  useEffect(() => {
    if (!selectedSectors || selectedSectors.length === 0) return;
    setSectorChecks(prev => {
      const next = { ...prev };
      // set any known sector to true if present in selectedSectors
      Object.keys(next).forEach(k => {
        next[k] = selectedSectors.includes(k);
      });
      return next;
    });
  }, [selectedSectors]);

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
  const [changePeriod, setChangePeriod] = useState<'daily'|'weekly'|'monthly'>('daily');
  const [changePercent, setChangePercent] = useState('');
  const [marketCapMin, setMarketCapMin] = useState('');
  const [marketCapMax, setMarketCapMax] = useState('');

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ExpandableSidebarItem title="Sector">
          {Object.keys(sectorChecks).map((key) => (
            <label key={key} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0'}}>
              <input
                type="checkbox"
                checked={!!sectorChecks[key]}
                onChange={() => {
                  setSectorChecks(prev => {
                    const next = { ...prev, [key]: !prev[key] };
                    // Inform parent of new selection
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
            <label key={key} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0'}}>
              <input type="checkbox" checked={!!industryChecks[key]} onChange={() => setIndustryChecks(prev => ({...prev, [key]: !prev[key]}))} />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Region">
          {Object.keys(regionChecks).map((key) => (
            <label key={key} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0'}}>
              <input type="checkbox" checked={!!regionChecks[key]} onChange={() => setRegionChecks(prev => ({...prev, [key]: !prev[key]}))} />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Market">
          {Object.keys(marketChecks).map((key) => (
            <label key={key} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0'}}>
              <input type="checkbox" checked={!!marketChecks[key]} onChange={() => setMarketChecks(prev => ({...prev, [key]: !prev[key]}))} />
              <span>{key}</span>
            </label>
          ))}
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Stocks Traded Volume">
          <div style={{marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 600}}>Average Volume</div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <input
                type="text"
                placeholder="Min"
                value={avgVolumeMin}
                onChange={e => setAvgVolumeMin(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
              <input
                type="text"
                placeholder="Max"
                value={avgVolumeMax}
                onChange={e => setAvgVolumeMax(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
            </div>
          </div>
          <div>
            <div style={{fontWeight: 600}}>Today's Volume</div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <input
                type="text"
                placeholder="Min"
                value={todayVolumeMin}
                onChange={e => setTodayVolumeMin(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
              <input
                type="text"
                placeholder="Max"
                value={todayVolumeMax}
                onChange={e => setTodayVolumeMax(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
            </div>
          </div>
          <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b'}}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="52-Week Range">
          <div style={{marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 600}}>52-Week High</div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <input
                type="text"
                placeholder="Min"
                value={high52Min}
                onChange={e => setHigh52Min(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
              <input
                type="text"
                placeholder="Max"
                value={high52Max}
                onChange={e => setHigh52Max(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
            </div>
          </div>
          <div>
            <div style={{fontWeight: 600}}>52-Week Low</div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <input
                type="text"
                placeholder="Min"
                value={low52Min}
                onChange={e => setLow52Min(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
              <input
                type="text"
                placeholder="Max"
                value={low52Max}
                onChange={e => setLow52Max(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
            </div>
          </div>
          <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b'}}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Share Price">
          <div style={{marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 600}}>Share Price</div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <input
                type="text"
                placeholder="Min"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
              <input
                type="text"
                placeholder="Max"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
            </div>
          </div>
          <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b'}}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="Market Cap">
          <div style={{marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 600}}>Market Cap</div>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
              <input
                type="text"
                placeholder="Min"
                value={marketCapMin}
                onChange={e => setMarketCapMin(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
              <input
                type="text"
                placeholder="Max"
                value={marketCapMax}
                onChange={e => setMarketCapMax(e.target.value)}
                className="sidebar-input"
                style={{flex: 1, padding: '0.4rem'}}
              />
            </div>
          </div>
          <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b'}}>
            (No filtering functionality implemented; inputs are for UI only.)
          </div>
        </ExpandableSidebarItem>

        <ExpandableSidebarItem title="% Change">
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <div>
              <label style={{marginRight: '0.5rem'}}>Period:</label>
              <select value={changePeriod} onChange={e => setChangePeriod(e.target.value as any)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{display: 'block', fontWeight: 600}}>Percent Threshold</label>
              <input
                type="number"
                placeholder="e.g. 2.5"
                value={changePercent}
                onChange={e => setChangePercent(e.target.value)}
                className="sidebar-input"
                style={{width: '100%', padding: '0.4rem', marginTop: '0.25rem'}}
              />
            </div>
          </div>
        </ExpandableSidebarItem>
      </nav>
    </aside>
  );
};

export default Sidebar;
