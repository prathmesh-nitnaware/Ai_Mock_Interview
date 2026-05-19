import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Mic,
  Terminal,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Chatbot';
import '../../styles/layout.css';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = user?.role === 'admin' 
    ? [
        { name: 'Admin Panel', path: '/admin', icon: <Shield size={18} /> },
        { name: 'Profile',     path: '/profile', icon: <User size={18} /> },
      ]
    : [
        { name: 'Dashboard',     path: '/dashboard',      icon: <LayoutDashboard size={18} /> },
        { name: 'ATS Optimizer', path: '/resume/upload',  icon: <FileText size={18} /> },
        { name: 'Mock Interview', path: '/interview/setup', icon: <Mic size={18} /> },
        { name: 'Coding Dojo',   path: '/coding/dojo',    icon: <Terminal size={18} /> },
        { name: 'Profile',       path: '/profile',        icon: <User size={18} /> },
      ];



  return (
    <div className="app-layout">
      {/* Animated background blobs */}
      <div className="global-live-bg">
        <div className="g-blob g-blob-1"></div>
        <div className="g-blob g-blob-2"></div>
        <div className="g-blob g-blob-3"></div>
      </div>

      {/* ── HEADER ───────────────────────────────────── */}
      <header className="glass-header">
        <div className="header-left">
          {user?.role !== 'admin' && (
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="brand-logo">
            <div className="brand-icon-glow">
              <Sparkles size={15} />
            </div>
            <span>PREP AI</span>
          </Link>
        </div>

        <div className="header-right">
          {user?.role === 'admin' && (
            <button 
              onClick={logout} 
              className="sidebar-link logout-btn" 
              style={{ 
                width: 'auto', 
                border: '1px solid var(--border-default)', 
                borderRadius: '8px', 
                padding: '6px 14px', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* ── SIDEBAR ──────────────────────────────────── */}
      {user?.role !== 'admin' && (
        <aside className={`glass-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="sidebar-nav">
            <span className="sidebar-section-label">Navigation</span>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="link-icon">{link.icon}</span>
                <span className="link-text">{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button onClick={logout} className="sidebar-link logout-btn">
              <span className="link-icon"><LogOut size={18} /></span>
              <span className="link-text">Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────── */}
      <main className={`main-content-area ${user?.role === 'admin' ? 'no-sidebar' : ''}`}>
        {isMobileMenuOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <Outlet />
        {user?.role !== 'admin' && <Chatbot />}
      </main>
    </div>
  );
};

export default Layout;
