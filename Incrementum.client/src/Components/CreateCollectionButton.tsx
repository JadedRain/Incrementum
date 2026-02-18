import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateCollectionButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="collection-card-create cursor-pointer collection-card-create-inner"
      onClick={() => navigate('/create-custom-collection')}
      tabIndex={0}
      role="button"
    >
      <span className="collection-card-create-icon">＋</span>
      <span className="collection-card-create-label">Create New Collection</span>
    </div>
  );
};
