import React from 'react';
import '../components.css'; // Path synchronized with your file tree

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  disabled = false, 
  isLoading = false,
  className = '',
  icon = null
}) => {
  
  // Combines the base .btn class with your variant styles from components.css
  const buttonClass = `btn btn-${variant} ${isLoading ? 'btn-loading' : ''} ${className}`;

  return (
    <button 
      type={type} 
      className={buttonClass} 
      onClick={onClick} 
      disabled={disabled || isLoading}
    >
      {/* Loading Spinner - Uses the CSS keyframes from your components.css */}
      {isLoading && (
        <span className="spinner">
          <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}

      {/* Button Content - Hidden visually while loading but maintains button width */}
      <span className="btn-content" style={{ opacity: isLoading ? 0 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span className="btn-icon" style={{ display: 'flex' }}>{icon}</span>}
        {children}
      </span>
      
      {/* Glow Effect Layer - Hooked into your :hover CSS states */}
      {variant === 'primary' && !disabled && !isLoading && <div className="btn-glow-layer" />}
    </button>
  );
};

export default Button;
