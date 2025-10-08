import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface IndustryFilterProps {
  industryChecks: { [k: string]: boolean };
  setIndustryChecks: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
  onSelectedIndustriesChange?: (industries: string[]) => void;
}

const IndustryFilter: React.FC<IndustryFilterProps> = ({
  industryChecks,
  setIndustryChecks,
  onSelectedIndustriesChange
}) => {
  return (
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
  );
};

export default IndustryFilter;