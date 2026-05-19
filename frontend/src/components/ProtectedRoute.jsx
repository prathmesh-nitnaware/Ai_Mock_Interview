import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./components.css";

/* ── Dashboard Skeleton ─────────────────────────────────── */
const DashboardSkeleton = () => (
  <div className="skeleton-page">
    <div className="skeleton-content">

      {/* Header Row */}
      <div className="sk-header-row">
        <div className="sk-col">
          <div className="sk-block sk-pill"></div>
          <div className="sk-block sk-title"></div>
          <div className="sk-block sk-subtitle"></div>
        </div>
        <div className="sk-stats-row">
          <div className="sk-stat">
            <div className="sk-block sk-stat-val"></div>
            <div className="sk-block sk-stat-label"></div>
          </div>
          <div className="sk-stat">
            <div className="sk-block sk-stat-val"></div>
            <div className="sk-block sk-stat-label"></div>
          </div>
        </div>
      </div>

      {/* Action Cards Row */}
      <div className="sk-cards-row">
        <div className="sk-card sk-card-primary"></div>
        <div className="sk-card"></div>
        <div className="sk-card"></div>
      </div>

      {/* History Section */}
      <div className="sk-section-label">
        <div className="sk-block sk-label"></div>
      </div>
      <div className="sk-history-row">
        <div className="sk-history-card">
          <div className="sk-block sk-hc-top"></div>
          <div className="sk-block sk-hc-role"></div>
          <div className="sk-block sk-hc-footer"></div>
        </div>
        <div className="sk-history-card">
          <div className="sk-block sk-hc-top"></div>
          <div className="sk-block sk-hc-role"></div>
          <div className="sk-block sk-hc-footer"></div>
        </div>
      </div>

    </div>
  </div>
);

/* ── ProtectedRoute ─────────────────────────────────────── */
const ProtectedRoute = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
