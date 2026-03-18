import type React from 'react';
import '../../styles/ScreenerTopBar.css';

interface CustomScreener {
  id: number;
  screener_name: string;
  created_at: string;
  filter_count: number;
}

interface TopBarProps {
  potentialGainsToggled: boolean;
  togglePotentialGains: () => void;
  onSave: () => void;
  onScreenerSelect?: (screenerId: string) => void;
  currentScreenerId?: string;
  customScreeners?: CustomScreener[];
}

const TopBar: React.FC<TopBarProps> = ({
  potentialGainsToggled,
  togglePotentialGains,
  onSave,
  onScreenerSelect,
  currentScreenerId,
  customScreeners = []
}) => {
  const prebuiltScreeners = [
    { value: 'day_gainers', label: 'Day Gainers' },
    { value: 'day_losers', label: 'Day Losers' },
    { value: 'most_actives', label: 'Most Actives' },
    { value: 'undervalued_growth_stocks', label: 'Undervalued Growth Stocks' },
    { value: 'custom_temp', label: 'None' },
  ];

  const getCurrentScreenerLabel = () => {
    // Check prebuilt screeners first
    const prebuilt = prebuiltScreeners.find(s => s.value === currentScreenerId);
    if (prebuilt) return prebuilt.label;
    
    // Check custom screeners
    const custom = customScreeners.find(s => s.id.toString() === currentScreenerId);
    if (custom) return custom.screener_name;
    
    return 'Switch Screener';
  };

  const handleScreenerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && onScreenerSelect) {
      onScreenerSelect(value);
    }
  };

  return (
    <div className='screener-topbar-inner'>
      <div className="screener-topbar-group">
        <div className="non-toggle-buttons">
          <button className="screener-topbar-btn" onClick={onSave}>
            Save
          </button>
          <select
            className="screener-topbar-select screener-dropdown-with-arrow"
            aria-label="Switch Screener"
            value={currentScreenerId || ''}
            onChange={handleScreenerChange}
            style={{ fontWeight: currentScreenerId ? '600' : 'normal' }}
          >
            <option value="" disabled>{getCurrentScreenerLabel()}</option>
            <optgroup label="Prebuilt Screeners">
              {prebuiltScreeners.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </optgroup>
            {customScreeners.length > 0 && (
              <optgroup label="My Screeners">
                {customScreeners.map(s => (
                  <option key={s.id} value={s.id.toString()}>{s.screener_name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>
      <button className="screener-topbar-btn screener-page-toggle" onClick={togglePotentialGains}>
        {!potentialGainsToggled && <p>Potential Gains/Loses</p>}
        {potentialGainsToggled && <p>General Market Data</p>}
      </button>
    </div>
  );
};

export default TopBar;