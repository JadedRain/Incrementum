import '../styles/Collections/CollectionCard.css'
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
      className="ScreenerPage-card cursor-pointer group relative"
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

      <div className="collection-card-image">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>

      <div className="ScreenerPage-card-content collection-card-content-wrapper">
        <h2 className="collection-card-title">{collection.name}</h2>
        <div className='collection-card-date'>
          {collection.date_created}
        </div>
        <p className="collection-card-description">{
          collection.description
            ? collection.description
            : (collection.stocks && collection.stocks.length > 0
              ? `${collection.stocks.length} stock${collection.stocks.length > 1 ? 's' : ''}`
              : 'No description.')
        }</p>
      </div>
    </div>
  );
};
