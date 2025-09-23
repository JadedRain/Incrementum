import React from "react";

interface BackButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, children }) => (
  <button className="ScreenerPage-button" onClick={onClick}>
    {children || "Back"}
  </button>
);

export default BackButton;
