import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../Context/AuthContext';
import { usePreferences } from '../Context/usePreferences';
import { fetchCustomScreeners } from '../Query/apiScreener';

interface ScreenerOption {
  id: string;
  name: string;
  type: 'public' | 'custom';
}

const PUBLIC_SCREENERS: ScreenerOption[] = [
  { id: 'day_gainers', name: 'Day Gainers', type: 'public' },
  { id: 'day_losers', name: 'Day Losers', type: 'public' },
  { id: 'most_actives', name: 'Most Actives', type: 'public' },
  { id: 'undervalued_growth_stocks', name: 'Undervalued Growth Stocks', type: 'public' },
  { id: 'custom_temp', name: 'Blank Screener', type: 'public' },
];

const DefaultScreenerSelector: React.FC = () => {
  const { apiKey } = useAuth();
  const { defaultScreener, setDefaultScreener } = usePreferences();

  // Fetch custom screeners if user is logged in
  const { data: customScreenersData } = useQuery<{
    screeners: Array<{ id: number; screener_name: string; created_at: string; filter_count: number }>;
  }>({
    queryKey: ['customScreeners', apiKey],
    queryFn: () => fetchCustomScreeners(apiKey),
    enabled: !!apiKey,
  });

  // Build all available screeners
  const allScreeners = useMemo(() => {
    const screeners = [...PUBLIC_SCREENERS];

    if (customScreenersData?.screeners) {
      customScreenersData.screeners.forEach((screener) => {
        screeners.push({
          id: String(screener.id), // Ensure id is a string
          name: screener.screener_name,
          type: 'custom' as const,
        });
      });
    }

    return screeners;
  }, [customScreenersData]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (!value) {
      setDefaultScreener(null);
      return;
    }

    const screener = allScreeners.find(
      (s) => `${s.type}:${s.id}` === value
    );
    if (screener) {
      const newDefault = {
        id: String(screener.id), // Ensure id is always a string for consistency
        type: screener.type as 'public' | 'custom',
        name: screener.name,
      };
      console.log('Setting default screener:', newDefault);
      setDefaultScreener(newDefault);
    }
  };

  const currentValue = defaultScreener
    ? `${defaultScreener.type}:${String(defaultScreener.id)}`
    : '';
    
  console.log('Current default screener from context:', defaultScreener);
  console.log('Current select value:', currentValue);

  return (
    <div>
      <label htmlFor="default-screener" style={{ display: 'block', marginBottom: '0.5rem' }}>
        Default Screener
      </label>
      <select
        id="default-screener"
        value={currentValue}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--text-primary)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: 'inherit',
        }}
      >
        <option value="">None (Use blank screener)</option>
        <optgroup label="Public Screeners">
          {PUBLIC_SCREENERS.map((screener) => (
            <option key={screener.id} value={`${screener.type}:${screener.id}`}>
              {screener.name}
            </option>
          ))}
        </optgroup>
        {customScreenersData?.screeners && customScreenersData.screeners.length > 0 && (
          <optgroup label="Your Custom Screeners">
            {customScreenersData.screeners.map((screener) => (
              <option key={screener.id} value={`custom:${screener.id}`}>
                {screener.screener_name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      {defaultScreener && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Currently set to: <strong>{defaultScreener.name}</strong>
        </p>
      )}
    </div>
  );
};

export default DefaultScreenerSelector;
