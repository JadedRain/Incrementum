import React, { useState } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { apiString } from '../../Context/FetchingHelper';

interface SaveCustomScreenerProps {
  filters: { filter_name: string; value: string }[];
  apiKey?: string;
}

const SaveCustomScreener: React.FC<SaveCustomScreenerProps> = ({
  filters,
  apiKey
}) => {
  const [screenerNameInput, setScreenerNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const response = await fetch(apiString('/custom-screeners/'), {
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
  );
};

export default SaveCustomScreener;