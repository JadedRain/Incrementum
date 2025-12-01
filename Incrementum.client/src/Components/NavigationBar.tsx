import '../styles/NavBar.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../Context/AuthContext';
import { ADMIN_EMAIL } from '../config/admin';

interface NavigationBarProps {
  showAccountButton?: boolean;
}

export default function NavigationBar({ showAccountButton = true }: NavigationBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiKey, signOut } = useAuth();
  const isAuthenticated = !!apiKey;
  const { email } = useAuth();
  const isAdminUser = !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
          {isAdminUser && (
            <Link
              to="/admin-page"
              className={`nav-button ${location.pathname === '/admin-page' ? 'nav-button-active' : ''}`}
            >
              Admin
            </Link>
          )}
          {showAccountButton && isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                signOut();
                setTimeout(() => navigate('/', { replace: true }), 0);
              }}
              className={`nav-button nav-button-logout`}
            >
              Logout
            </button>
          )}
          {!isAuthenticated && (
            <Link
              to="/"
              className={`nav-button ${location.pathname === '/' ? 'nav-button-active' : ''}`}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}