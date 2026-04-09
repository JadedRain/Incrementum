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
      className="toast"
      onClick={onClose}
    >
      {message}
    </div>
  );
};

export default Toast;