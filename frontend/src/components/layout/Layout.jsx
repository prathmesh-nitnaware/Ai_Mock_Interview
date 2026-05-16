import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  Terminal, 
  User, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Chatbot';
import '../../styles/layout.css'; 

const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'ATS Optimizer', path: '/resume/upload', icon: <FileText size={20} /> },
    { name: 'Mock Interview', path: '/interview/setup', icon: <Mic size={20} /> },
    { name: 'Coding Dojo', path: '/coding/dojo', icon: <Terminal size={20} /> },

    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="app-layout">
      {/* --- LIVE ANIMATED BACKGROUND --- */}
      <div className="global-live-bg">
        <div className="g-blob g-blob-1"></div>
        <div className="g-blob g-blob-2"></div>
        <div className="g-blob g-blob-3"></div>
      </div>
      
      {/* --- TOP HEADER --- */}
      <header className="glass-header">

        <div className="header-left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/dashboard" className="brand-logo">
             <div className="brand-icon-glow">
               <Sparkles size={16} />
             </div>
             <span>PREP AI</span>
          </Link>
        </div>

        {/* REMOVED header-right completely */}

      </header>

      {/* --- SIDEBAR --- */}
      <aside className={`glass-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        <nav className="sidebar-nav">
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
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <span className="link-icon">
              <LogOut size={20} />
            </span>
            <span className="link-text">Secure Log Out</span>
          </button>
        </div>

      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content-area">

        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <Outlet />
        <Chatbot />

      </main>

    </div>
  );
};

export default Layout;
