import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBriefcase, IconMenu, IconX, IconLogout } from './icons';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  const guestLinks = (
    <>
      <Link to="/login" className="nav-link" onClick={() => setOpen(false)}>
        Log in
      </Link>
      <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
        Get started free
      </Link>
    </>
  );

  const userLinks = (
    <>
      <NavLink to="/dashboard" className="nav-link" onClick={() => setOpen(false)}>
        Dashboard
      </NavLink>
      <NavLink to="/applications" className="nav-link" onClick={() => setOpen(false)}>
        Applications
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className="nav-link" onClick={() => setOpen(false)}>
          Admin
        </NavLink>
      )}
      <NavLink to="/profile" className="nav-link" onClick={() => setOpen(false)}>
        Profile
      </NavLink>
      <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
        <IconLogout width={16} height={16} />
        Logout
      </button>
    </>
  );

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <IconBriefcase width={18} height={18} />
          </span>
          <span className="brand-name">CareerFlow</span>
        </Link>

        <nav className="nav-links nav-links-desktop">{isAuthenticated ? userLinks : guestLinks}</nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <nav className="nav-links nav-links-mobile">
          {isAuthenticated && (
            <div className="mobile-user">
              <div className="mobile-user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
          )}
          {isAuthenticated ? userLinks : guestLinks}
        </nav>
      )}
    </header>
  );
}
