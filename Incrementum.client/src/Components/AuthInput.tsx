import React from "react";

const AuthInput: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, type, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-700 mb-2" htmlFor={label}>{label}</label>
    <input
      id={label}
      className="signin-input"
      type={type}
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default AuthInput;
