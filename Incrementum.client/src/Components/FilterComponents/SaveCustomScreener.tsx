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
      <div className="save-screener-form">
        <div>
          <input
            type="text"
            value={screenerNameInput}
            onChange={(e) => setScreenerNameInput(e.target.value)}
            placeholder="Enter screener name"
            className="sidebar-input"
            className="sidebar-input filter-input-full"
            disabled={saving}
          />
        </div>

        {error && (
          <div className="save-screener-error">{error}</div>
        )}

        {success && (
          <div className="save-screener-success">{success}</div>
        )}

        <button
          onClick={saveCustomScreener}
          disabled={saving || !screenerNameInput.trim()}
          className="save-screener-btn"
        >
          {saving ? 'Saving...' : 'Save Screener'}
        </button>

        <div className="save-screener-hint">
          Save the current filters as a custom screener. Filters will be added in future updates.
        </div>
      </div>
    </ExpandableSidebarItem>
  );
};

export default SaveCustomScreener;