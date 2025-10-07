import React from 'react';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  children,
  onClick,
  className = '',
  style
}: AppCardProps) => {
  return (
    <div
      className={`ScreenerPage-card cursor-pointer ${className}`}
      style={{ height: '120px', ...style }}
      onClick={onClick}
    >
      {title && <div className="text-sm text-center">{title}</div>}
      {subtitle && <div className="text-xs text-center mt-1">{subtitle}</div>}
      {children}
    </div>
  );
};

export default AppCard;
