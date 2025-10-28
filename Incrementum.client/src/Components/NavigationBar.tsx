import '../styles/NavBar.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../Context/AuthContext';

interface NavigationBarProps {
  showAccountButton?: boolean;
}

export default function NavigationBar({ showAccountButton = true }: NavigationBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiKey, signOut } = useAuth();
  const isAuthenticated = !!apiKey;

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
          {isAuthenticated && (
            <>
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
            </>
          )}
          {showAccountButton && isAuthenticated && (
            <Link
              to="/settings"
              className={`nav-button ${location.pathname === '/settings' ? 'nav-button-active' : ''}`}
            >
              Settings
            </Link>
          )}
          {showAccountButton && isAuthenticated && (
            <button
              type="button"
              onClick={() => { signOut(); navigate('/'); }}
              className={`nav-button nav-button-logout`}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}