import React from 'react';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  imageUrl,
  children,
  onClick,
  className = '',
  style
}: AppCardProps) => {
  return (
    <div
      className={`ScreenerPage-card cursor-pointer ${className}`}
      style={{ height: '357px', ...style }}
      onClick={onClick}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title || 'Card image'} 
          className="ScreenerPage-card-image"
        />
      ) : (
        <div className="ScreenerPage-card-image-placeholder" />
      )}
      <div className="ScreenerPage-card-content">
        {title && <div className="text-sm ScreenerPage-card-title">{title}</div>}
        {subtitle && <div className="text-xs mt-1 ScreenerPage-card-description">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
};

export default AppCard;
