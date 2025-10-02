import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import BackButton from '../Components/BackButton';
import '../App.css';

function CustomScreenerPage() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  
  // Custom screener creation state
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
      const response = await fetch('http://localhost:8000/custom-screeners/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': apiKey,
        },
        body: JSON.stringify({
          name: screenerNameInput.trim(),
          numeric_filters: [],
          categorical_filters: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Screener "${screenerNameInput}" saved successfully!`);
        setScreenerNameInput('');
        console.log('Screener saved:', data);
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
    <div className="min-h-screen bg-[hsl(40,62%,26%)]">
      <div className="ScreenerPage-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1 className="ScreenerPage-h1">Create Custom Screener</h1>
      </div>
      <div className="pt-32 px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Your Custom Screener</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screener Name *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={screenerNameInput}
              onChange={(e) => setScreenerNameInput(e.target.value)}
              placeholder="Enter a name for your screener (e.g., 'High Dividend Tech Stocks')"
              maxLength={100}
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose a descriptive name for your custom screener
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
              onClick={() => navigate('/screener')}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={saveCustomScreener}
              disabled={saving || !screenerNameInput.trim()}
            >
              {saving ? 'Saving...' : 'Save Screener'}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Note:</h3>
            <p className="text-sm text-gray-600">
              For now, this creates a basic screener with just a name. Filter functionality will be added in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomScreenerPage;