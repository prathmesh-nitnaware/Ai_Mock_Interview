import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./components.css"; 

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="neon-spinner-large"></div>
        <p className="loading-text">Authenticating Secure Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the login page, but save where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
