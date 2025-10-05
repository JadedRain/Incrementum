import React from 'react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '12px',
        right: '12px',
        background: '#2d2d2d',
        color: '#EBCB92',
        padding: '10px 14px',
        borderRadius: 8,
        boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
};

export default Toast;