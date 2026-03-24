import React, { useState } from 'react';
import './SaveScreenerPopup.css';

interface SaveScreenerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

const SaveScreenerPopup: React.FC<SaveScreenerPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  defaultName = ''
}) => {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
      setName('');
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
