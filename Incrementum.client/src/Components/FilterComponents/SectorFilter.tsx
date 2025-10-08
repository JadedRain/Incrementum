import React from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

interface SectorFilterProps {
  sectorChecks: { [k: string]: boolean };
  setSectorChecks: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
  onSelectedSectorsChange?: (sectors: string[]) => void;
}

const SectorFilter: React.FC<SectorFilterProps> = ({
  sectorChecks,
  setSectorChecks,
  onSelectedSectorsChange
}) => {
  return (
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
  );
};

export default SectorFilter;