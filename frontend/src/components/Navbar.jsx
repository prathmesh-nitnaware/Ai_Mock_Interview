import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';
import "./components.css";

const Navbar = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Sparkles size={14} />
          </div>
          <span className="nav-logo-text">PREP <span className="logo-accent">AI</span></span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links-right">
          <ThemeToggle />
          <Link to="/login" className="nav-link-ghost">Sign In</Link>
          <Link to="/signup" className="nav-cta-btn">
            Get Started
            <span className="nav-cta-arrow">→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
