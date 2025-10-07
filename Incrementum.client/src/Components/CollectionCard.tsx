import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CustomCollection } from '../hooks/useCustomCollections';

interface CollectionCardProps {
  collection: CustomCollection;
  onRemove: (id: number) => void;
}

export const CollectionCard = ({ collection, onRemove }: CollectionCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      key={collection.id}
      className="ScreenerPage-card cursor-pointer h-48 flex flex-col justify-center items-center text-center space-y-2 group relative"
      onClick={() => navigate(`/custom-collection/${collection.id}`)}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/custom-collection/${collection.id}`); }}
      tabIndex={0}
      role="button"
    >
      <button
        className="xbutton"
        style={{ pointerEvents: 'auto' }}
        onClick={e => { e.stopPropagation(); onRemove(collection.id); }}
        tabIndex={-1}
        aria-label="Remove collection"
      >
        &times;
      </button>
      <h2 className="text-lg font-bold leading-relaxed m-0">{collection.name}</h2>
      <p className="text-gray-700 leading-relaxed mb-2">{collection.description || 'No description.'}</p>
    </div>
  );
};
