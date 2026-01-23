import type React from 'react';
import '../../styles/ScreenerTopBar.css';
interface TopBarProps {
  potentialGainsToggled: boolean;
  togglePotentialGains: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  potentialGainsToggled,
  togglePotentialGains
}) => {
  return (
    <div className="screener-topbar">
      <div className="screener-topbar-group">
        <div className="non-toggle-buttons">
          <button className="screener-topbar-btn">
            Save
          </button>
          <select
            className="screener-topbar-select"
            aria-label="Select Collection"
            defaultValue=""
          >
            <option value="" disabled>
              Select Collection
            </option>
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