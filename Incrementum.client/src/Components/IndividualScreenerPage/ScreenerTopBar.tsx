import type React from 'react';
import '../../styles/ScreenerTopBar.css';

interface TopBarProps {
  potentialGainsToggled: boolean;
  togglePotentialGains: () => void;
  onSave: () => void;
  onScreenerSelect?: (screenerId: string) => void;
  currentScreenerId?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  potentialGainsToggled,
  togglePotentialGains,
  onSave,
  onScreenerSelect,
  currentScreenerId
}) => {
  const prebuiltScreeners = [
    { value: 'day_gainers', label: 'Day Gainers' },
    { value: 'day_losers', label: 'Day Losers' },
    { value: 'most_actives', label: 'Most Actives' },
    { value: 'undervalued_growth_stocks', label: 'Undervalued Growth Stocks' },
    { value: 'custom_temp', label: 'Blank Screener' },
  ];

  const getCurrentScreenerLabel = () => {
    const current = prebuiltScreeners.find(s => s.value === currentScreenerId);
    return current ? current.label : 'Switch Screener';
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
            {prebuiltScreeners.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
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