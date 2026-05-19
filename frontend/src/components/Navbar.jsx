import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sparkles } from 'lucide-react';
import "./components.css";

const Navbar = () => {
  const { user } = useAuth();
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
