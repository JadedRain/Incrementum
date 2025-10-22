import React from "react";
import '../styles/SignIn.css'

const AuthInput: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, type, value, onChange }) => (
  <div className="mb-4">
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
