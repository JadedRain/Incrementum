import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface PercentChangeFilterProps {
  changePeriod: 'daily' | 'weekly' | 'monthly';
  onChangePeriod?: (period: 'daily' | 'weekly' | 'monthly') => void;
  localPercentChangeFilter: string;
  setLocalPercentChangeFilter: React.Dispatch<React.SetStateAction<string>>;
  onPercentChangeFilter?: (filter: string) => void;
  percentThreshold?: string;
  changePercent: string;
  setChangePercent: React.Dispatch<React.SetStateAction<string>>;
  onPercentThresholdChange?: (value: string) => void;
}

const PercentChangeFilter: React.FC<PercentChangeFilterProps> = ({
  changePeriod,
  onChangePeriod,
  localPercentChangeFilter,
  setLocalPercentChangeFilter,
  onPercentChangeFilter,
  percentThreshold,
  changePercent,
  setChangePercent,
  onPercentThresholdChange
}) => {
  return (
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
  );
};

export default PercentChangeFilter;