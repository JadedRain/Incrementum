import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateCollectionButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="ScreenerPage-card-custom cursor-pointer"
      onClick={() => navigate('/create-custom-collection')}
      tabIndex={0}
      role="button"
    >
      <span style={{ fontSize: 32, marginBottom: 8 }}>＋</span>
      <span>Create New Collection</span>
    </div>
  );
};
