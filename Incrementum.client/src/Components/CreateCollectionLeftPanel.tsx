import React from 'react';
import CollectionNameEditor from './CollectionNameEditor';
import StockSearchPanel from './StockSearchPanel';

interface Props {
  collectionName: string;
  collectionDesc?: string;
  editMode: boolean;
  pendingName: string;
  pendingDescription: string;
  onPendingNameChange: (v: string) => void;
  onPendingDescChange: (v: string) => void;
  onSaveName: (name?: string, desc?: string) => Promise<void> | void;
  onCancelEdit: () => void;
  onEditName: () => void;
  newToken: string;
  setNewToken: (v: string) => void;
  searchStocks: () => Promise<void> | void;
  searching: boolean;
  searchResults: unknown[];
  onAddStock: (symbol: string) => void;
  onSaveCollection: () => Promise<void> | void;
  onCancel: () => void;
  saving?: boolean;
}

const CreateCollectionLeftPanel: React.FC<Props> = ({
  collectionName,
  collectionDesc,
  editMode,
  pendingName,
  pendingDescription,
  onPendingNameChange,
  onPendingDescChange,
  onSaveName,
  onCancelEdit,
  onEditName,
  newToken,
  setNewToken,
  searchStocks,
  searching,
  searchResults,
  onAddStock,
  onSaveCollection,
  onCancel,
  saving,
}) => {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col gap-4" style={{ height: '100%' }}>
      <div className="bg-[hsl(40,63%,63%)] shadow-[5px_5px_5px_#3F3A30] p-6 flex-shrink-0" style={{ borderRadius: '2px' }}>
        <CollectionNameEditor
          collectionName={collectionName}
          description={collectionDesc}
          editMode={editMode}
          pendingName={pendingName}
          pendingDescription={pendingDescription}
          onPendingNameChange={onPendingNameChange}
          onPendingDescChange={onPendingDescChange}
          onSave={onSaveName}
          onCancel={onCancelEdit}
          onEdit={onEditName}
        />
      </div>

      <div className="bg-[hsl(40,63%,63%)] shadow-[5px_5px_5px_#3F3A30] p-4 flex-1 overflow-hidden flex flex-col" style={{ borderRadius: '2px' }}>
        <StockSearchPanel
          searchQuery={newToken}
          onSearchQueryChange={setNewToken}
          onSearch={searchStocks}
          searching={searching}
          searchResults={searchResults}
          onAddStock={onAddStock}
        />

        <div className="buttons-container">
          <button className="buttons primary" onClick={onSaveCollection} disabled={saving}>
            {saving ? 'Saving…' : 'Save Collection'}
          </button>
          <button className="buttons" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCollectionLeftPanel;