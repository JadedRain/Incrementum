import React, { useState } from 'react';
import './SaveCollectionPopup.css';

interface SaveCollectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
}

const SaveCollectionPopup: React.FC<SaveCollectionPopupProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, description);
      setName('');
      setDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-xl shadow-2xl min-w-[320px] max-w-[90vw] flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-2">Save Collection</h2>
        <input
          type="text"
          placeholder="Collection Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-base"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-base min-h-[60px] resize-y"
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

export default SaveCollectionPopup;
