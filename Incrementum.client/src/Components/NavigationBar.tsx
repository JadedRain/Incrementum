import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

interface NavigationBarProps {
  showAccountButton?: boolean;
}

export default function NavigationBar({ showAccountButton = true }: NavigationBarProps) {
  const location = useLocation();

  return (
    <div className="navbar-header">
      <div className="navbar-container">
        {/* Logo/Home Link */}
        <Link to="/screener" className="navbar-logo">
          Incrementum
        </Link>

        {/* Search Bar */}
        <div className="navbar-search">
          <SearchBar />
        </div>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <Link
            to="/screener"
            className={`nav-button ${location.pathname.startsWith('/screener') ? 'nav-button-active' : ''}`}
          >
            Screener
          </Link>
          <Link
            to="/watchlist"
            className={`nav-button ${location.pathname === '/watchlist' ? 'nav-button-active' : ''}`}
          >
            Watchlist
          </Link>
          <Link
            to="/custom-collections"
            className={`nav-button ${location.pathname.startsWith('/custom-collections') ? 'nav-button-active' : ''}`}
          >
            Collections
          </Link>
          {showAccountButton && (
            <Link 
              to="/account" 
              className={`nav-button ${location.pathname === '/account' ? 'nav-button-active' : ''}`}
            >
              Account
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}