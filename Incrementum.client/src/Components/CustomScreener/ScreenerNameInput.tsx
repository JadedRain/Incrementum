import React from 'react';
import { useScreenerForm } from '../../Context/ScreenerFormContext';

interface ScreenerNameInputProps {
  placeholder?: string;
  maxLength?: number;
}

const ScreenerNameInput: React.FC<ScreenerNameInputProps> = ({
  placeholder = "Enter a name for your screener (e.g., 'High Dividend Tech Stocks')",
  maxLength = 100
}) => {
  const { screenerName, setScreenerName } = useScreenerForm();
  return (
    <div className="custom-screener-input-group">
      <label className="custom-screener-label">
        Screener Name *
      </label>
      <input
        type="text"
        className="custom-screener-input"
        value={screenerName}
        onChange={(e) => setScreenerName(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <p className="custom-screener-help-text">
        Choose a descriptive name for your custom screener
      </p>
    </div>
  );
};

export default ScreenerNameInput;