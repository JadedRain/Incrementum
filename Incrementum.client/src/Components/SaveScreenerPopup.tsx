import React, { useState } from 'react';
import './SaveScreenerPopup.css';
import type { ScreenerVisibility } from '../Query/apiScreener';

interface SaveScreenerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, visibility: ScreenerVisibility) => void;
  defaultName?: string;
  defaultVisibility?: ScreenerVisibility;
}

const SaveScreenerPopup: React.FC<SaveScreenerPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  defaultName = '',
  defaultVisibility = 'private',
}) => {
  const [name, setName] = useState(defaultName);
  const [visibility, setVisibility] = useState<ScreenerVisibility>(defaultVisibility);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, visibility);
      setName('');
      setVisibility(defaultVisibility);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-xl shadow-2xl min-w-[320px] max-w-[90vw] flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-2">Save Screener Profile</h2>
        <p className="text-sm text-gray-600 mb-2">
          Save the current filters as a screener profile
        </p>
        <input
          type="text"
          placeholder="Screener Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-base"
        />
        <div>
          <label className="text-sm text-gray-600 block mb-1" htmlFor="screener-visibility">
            Visibility
          </label>
          <select
            id="screener-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ScreenerVisibility)}
            className="w-full p-2 border border-gray-300 rounded text-base"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="community">Community</option>
          </select>
        </div>
        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={onClose}
            className="cancel-button"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="save-button"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveScreenerPopup;
