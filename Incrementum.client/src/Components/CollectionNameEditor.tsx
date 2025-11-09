import React from 'react';

interface CollectionNameEditorProps {
  collectionName: string;
  editMode: boolean;
  pendingName: string;
  onPendingNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

const CollectionNameEditor: React.FC<CollectionNameEditorProps> = ({
  collectionName,
  editMode,
  pendingName,
  onPendingNameChange,
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
        <div className="flex gap-2">
          <button className="IndividualCustomCollectionPage-button flex-1" onClick={onSave}>
            Save
          </button>
          <button className="IndividualCustomCollectionPage-button flex-1" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-[hsl(40,62%,20%)] mb-2">{collectionName}</h2>
      <p className="text-sm text-[hsl(40,62%,30%)] mb-4">Description</p>
      <button className="IndividualCustomCollectionPage-button w-full" onClick={onEdit}>
        Edit Name
      </button>
    </>
  );
};

export default CollectionNameEditor;
