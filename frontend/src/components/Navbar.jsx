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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''} ${isDashboard ? 'dashboard-nav-style' : ''}`}>
        
        <div className="navbar-container">
          
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="icon-glow-circle-small">
              <Sparkles size={18} />
            </div>
            <span className="logo-text">PREP AI</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links desktop-only">
            {!isDashboard && (
              <>
                <Link to="/" className="nav-link">Features</Link>
                <Link to="/login" className="nav-link">Secure Log In</Link>
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
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {!isDashboard && (
            <>
              <Link to="/" className="mobile-link">Features</Link>
              <Link to="/login" className="mobile-link">Log In</Link>
              <Link to="/signup" className="mobile-link highlight">Get Started</Link>
            </>
          )}
        </div>

      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
    </>
  );
};

export default Navbar;
