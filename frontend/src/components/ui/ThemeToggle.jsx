import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${theme} ${className}`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      <div className="theme-toggle-icon-wrap">
        {theme === 'dark' ? (
          <Sun size={16} className="theme-icon sun-icon" />
        ) : (
          <Moon size={16} className="theme-icon moon-icon" />
        )}
      </div>
      <span className="theme-toggle-label">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
