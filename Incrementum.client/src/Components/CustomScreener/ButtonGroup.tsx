import React from 'react';

interface ButtonGroupProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
  saveText?: string;
  cancelText?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  onCancel,
  onSave,
  saving,
  disabled,
  saveText = 'Save Screener',
  cancelText = 'Cancel'
}) => {
  return (
    <div className="custom-screener-button-group">
      <button
        className="custom-screener-cancel-button"
        onClick={onCancel}
      >
        {cancelText}
      </button>
      <button
        className="custom-screener-save-button"
        onClick={onSave}
        disabled={disabled}
      >
        {saving ? 'Saving...' : saveText}
      </button>
    </div>
  );
};

export default ButtonGroup;