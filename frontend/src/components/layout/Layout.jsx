import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Mic,
  Terminal,
  User,
  LogOut,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Chatbot';
import ThemeToggle from '../ui/ThemeToggle';
import '../../styles/layout.css';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  // Tab config for regular users
  const tabLinks = [
    { name: 'Home',      path: '/dashboard',      icon: <LayoutDashboard size={20} /> },
    { name: 'Resume',    path: '/resume/upload',  icon: <FileText size={20} /> },
    { name: 'Interview', path: '/interview/setup', icon: <Mic size={20} /> },
    { name: 'Coding',    path: '/coding/dojo',    icon: <Terminal size={20} /> },
    { name: 'Profile',   path: '/profile',        icon: <User size={20} /> },
  ];

  const adminTabLinks = [
    { name: 'Admin',   path: '/admin',   icon: <Shield size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const activeLinks = user?.role === 'admin' ? adminTabLinks : tabLinks;

  // Extract first initial for avatar
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="app-layout">
      {/* Animated background blobs */}
      <div className="global-live-bg">
        <div className="g-blob g-blob-1"></div>
        <div className="g-blob g-blob-2"></div>
        <div className="g-blob g-blob-3"></div>
      </div>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="glass-header">
        <div className="header-left">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="brand-logo">
            <div className="brand-icon-box">
              <Sparkles size={15} />
            </div>
            <span className="brand-text">PREP AI</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-header-nav">
            {activeLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`desktop-nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <ThemeToggle />
          {user?.role === 'admin' ? (
            <button onClick={logout} className="header-logout-btn" title="Sign Out">
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          ) : (
            <>
              <Link to="/profile" className="header-user-pill">
                <div className="header-avatar">{initial}</div>
                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button onClick={logout} className="header-logout-btn" title="Sign Out">
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────── */}
      <main className={`main-content-area ${user?.role === 'admin' ? 'no-sidebar' : ''}`}>
        <Outlet />
        {user?.role !== 'admin' && <Chatbot />}
      </main>

      {/* ── BOTTOM TAB BAR ─────────────────────────────── */}
      <nav className="bottom-tab-bar">
        {activeLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`tab-item ${isActive(link.path) ? 'active' : ''}`}
          >
            <div className="tab-icon-wrap">
              {link.icon}
            </div>
            <span className="tab-label">{link.name}</span>
          </Link>
        ))}
        {/* Logout tab at end for non-admin */}
        {user?.role !== 'admin' && (
          <button className="tab-item" onClick={logout}>
            <div className="tab-icon-wrap">
              <LogOut size={20} />
            </div>
            <span className="tab-label">Logout</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default Layout;
