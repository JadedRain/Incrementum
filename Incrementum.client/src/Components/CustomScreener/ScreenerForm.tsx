import React from 'react';
import { useScreenerForm } from '../../Context/ScreenerFormContext';
import ScreenerNameInput from './ScreenerNameInput';
import ButtonGroup from './ButtonGroup';

interface ScreenerFormProps {
  title?: string;
  onCancel: () => void;
  onSave: () => void;
  showNameInput?: boolean;
}

const ScreenerForm: React.FC<ScreenerFormProps> = ({
  title = 'Create Your Custom Screener',
  onCancel,
  onSave,
  showNameInput = true
}) => {
  const { screenerName, saving } = useScreenerForm();
  const isSaveDisabled = saving || (showNameInput && !screenerName.trim());

  return (
    <div className="custom-screener-form">
      <h2 className="custom-screener-title">{title}</h2>
      
      {showNameInput && <ScreenerNameInput />}
      
      <ButtonGroup
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
        disabled={isSaveDisabled}
        saveText={showNameInput ? 'Save Screener' : 'Run Screener'}
      />
      
      <div className="custom-screener-note-section">
        <h3 className="custom-screener-note-title">Note:</h3>
        <p className="custom-screener-note-text">
          {showNameInput 
            ? 'For now, this creates a basic screener with just a name. Filter functionality will be added in future updates.'
            : 'Create and run a custom screener without saving. Sign in to save your screeners for later use.'}
        </p>
      </div>
    </div>
  );
};

export default ScreenerForm;