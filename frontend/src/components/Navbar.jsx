import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import "./components.css";

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`public-navbar ${isScrolled || isDashboard ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="icon-glow-circle-small">
              <Sparkles size={15} />
            </div>
            <span className="logo-text">PREP AI</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links desktop-only">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {!isDashboard && (
              <>
                <Link to="/login"  className="nav-link">Sign In</Link>
                <Link to="/signup">
                  <button className="btn-glow-nav">Get Started</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <button
            className="mobile-link"
            onClick={toggleTheme}
            style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}
          >
            {theme === 'dark' ? '☀️  Light Mode' : '🌙  Dark Mode'}
          </button>
          {!isDashboard && (
            <>
              <Link to="/login"  className="mobile-link">Sign In</Link>
              <Link to="/signup" className="mobile-link highlight">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          style={{ position:'fixed', inset:0, zIndex:250 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
