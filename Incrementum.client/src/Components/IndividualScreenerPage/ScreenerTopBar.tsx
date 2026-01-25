import type React from 'react';
import '../../styles/ScreenerTopBar.css';
import type { CustomCollection } from '../../hooks/useCustomCollections';
interface TopBarProps {
  potentialGainsToggled: boolean;
  togglePotentialGains: () => void;
  onSave: () => void;
  collections: CustomCollection[];
  selectedCollectionId: number | null;
  onSelectCollection: (id: number | null) => void;
  collectionsLoading: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  potentialGainsToggled,
  togglePotentialGains,
  onSave,
  collections,
  selectedCollectionId,
  onSelectCollection,
  collectionsLoading
}) => {
  return (
    <div className='screener-topbar-inner'>
      <div className="screener-topbar-group">
        <div className="non-toggle-buttons">
          <button className="screener-topbar-btn" onClick={onSave}>
            Save
          </button>
          <select
            className="screener-topbar-select"
            aria-label="Select Collection"
            value={selectedCollectionId ?? ''}
            onChange={e => {
              const val = e.target.value;
              onSelectCollection(val ? Number(val) : null);
            }}
            disabled={collectionsLoading}
          >
            <option value="">Select Collection</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
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