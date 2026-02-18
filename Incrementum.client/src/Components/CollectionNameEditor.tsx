import React from 'react';

interface CollectionNameEditorProps {
  collectionName: string;
  editMode: boolean;
  pendingName: string;
  pendingDescription?: string;
  description?: string;
  onPendingNameChange: (name: string) => void;
  onPendingDescChange?: (desc: string) => void;
  onSave: (newName?: string, newDesc?: string) => void;
  onCancel: () => void;
  onEdit: () => void;
}

const CollectionNameEditor: React.FC<CollectionNameEditorProps> = ({
  collectionName,
  editMode,
  pendingName,
  pendingDescription,
  description,
  onPendingNameChange,
  onPendingDescChange,
  onSave,
  onCancel,
  onEdit
}) => {
  if (editMode) {
    return (
      <>
        <input
          className="search-bar newsreader-font w-full mb-2"
          value={pendingName}
          onChange={e => onPendingNameChange(e.target.value)}
          autoFocus
        />
        <textarea
          className="search-bar newsreader-font w-full mb-2 h-20"
          value={pendingDescription || ''}
          onChange={e => onPendingDescChange && onPendingDescChange(e.target.value)}
          placeholder="Description"
        />
        <div className="flex gap-2">
          <button className="buttons primary flex-1" onClick={() => onSave(pendingName, pendingDescription)}>
            Save
          </button>
          <button className="buttons flex-1" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{collectionName || 'Name'}</h2>
      <p className="text-sm text-[var(--text-primary)] mb-4">{description || pendingDescription || 'Description'}</p>
      <button className="keyword-tag" onClick={onEdit}>
        Edit
      </button>
    </>
  );
};

export default CollectionNameEditor;