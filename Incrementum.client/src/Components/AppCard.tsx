import React from 'react';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  showWatchlistButton?: boolean;
  inWatchlist?: boolean;
  onWatchlistClick?: (e: React.MouseEvent) => void;
  isPending?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  imageUrl,
  children,
  onClick,
  className = '',
  style,
  showWatchlistButton = false,
  inWatchlist = false,
  onWatchlistClick,
  isPending = false
}: AppCardProps) => {
  return (
    <div
      className={`ScreenerPage-card cursor-pointer ${className}`}
      style={style}
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
        {showWatchlistButton && onWatchlistClick && (
          <button
            className={`mt-3 px-3 py-1.5 text-xs rounded transition-colors ${
              isPending
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : inWatchlist
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isPending) onWatchlistClick(e);
            }}
            disabled={isPending}
          >
            {isPending ? 'Loading...' : inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppCard;