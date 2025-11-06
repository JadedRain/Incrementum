import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateCollectionButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="collection-card-create cursor-pointer"
      onClick={() => navigate('/create-custom-collection')}
      tabIndex={0}
      role="button"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>＋</span>
      <span style={{ fontSize: 18, fontWeight: 600 }}>Create New Collection</span>
    </div>
  );
};
