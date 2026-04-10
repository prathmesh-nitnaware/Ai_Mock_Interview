import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Play, 
  UploadCloud, 
  Terminal, 
  ArrowUpRight, 
  Inbox, 
  Sparkles, 
  Zap, 
  Clock, 
  Trash2 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total_interviews: 0, average_score: 0 });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      // Fetch history from MongoDB 
      const historyData = await api.client.get("/api/interview/history");
      const sessions = historyData.data || [];
      setHistory(sessions);

      if (sessions.length > 0) {
        const total = sessions.length;
        const avg = Math.round(
          sessions.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / total
        );
        setStats({ total_interviews: total, average_score: avg });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); 
    if (!window.confirm("Permanently delete this session record?")) return;
    try {
      await api.client.delete(`/api/interview/delete/${sessionId}`);
      loadDashboardData(); 
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="neon-spinner-large"></div>
        <p className="loading-text">INITIALIZING WORKSPACE...</p>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || "DEVELOPER";

  return (
    <div className="dashboard-page fade-in">
      <div className="noise-bg"></div>
      <div className="ambient-glow"></div>

      <div className="dashboard-content">
        
        {/* HEADER SECTION */}
        <section className="profile-header-section">
            <div className="profile-text">
                <div className="brand-pill-light mb-4">
                   <Sparkles size={14} />
                   <span>{user?.role || "ML ENGINEER"}</span>
                </div>
                <h1 className="welcome-title">HELLO, {firstName}</h1>
                <p className="text-muted subtitle">Your career intelligence hub is active.</p>
            </div>
            
            <div className="stats-mini-grid">
                <div className="mini-stat">
                    <span className="ms-val">{stats.total_interviews}</span>
                    <div className="text-muted" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>SESSIONS</div>
                </div>
                <div className="mini-stat">
                    <span className="ms-val" style={{ color: '#6366f1' }}>{stats.average_score}%</span>
                    <div className="text-muted" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>AVG SCORE</div>
                </div>
            </div>
        </section>

        {/* MAIN ACTION TILES */}
        <section className="main-actions-grid">
            <Link to="/interview/setup" className="action-link-card primary-action">
                <div className="icon-box"><Play size={32} /></div>
                <div className="card-info">
                  <h3>Mock Interview</h3>
                  <p className="text-muted">5-Stage AI Simulation</p>
                </div>
            </Link>

            <Link to="/resume/upload" className="action-link-card">
                <div className="icon-box"><UploadCloud size={32} /></div>
                <div className="card-info">
                  <h3>Resume Scan</h3>
                  <p className="text-muted">ATS Optimization</p>
                </div>
            </Link>

            <Link to="/coding/dojo" className="action-link-card">
                <div className="icon-box"><Terminal size={32} /></div>
                <div className="card-info">
                  <h3>Coding Dojo</h3>
                  <p className="text-muted">Algorithm Practice</p>
                </div>
            </Link>
        </section>

        {/* COMPACT SESSION HISTORY (Last 2 Only)  */}
        <section className="recent-section">
            <div className="section-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="section-head" style={{ fontSize: '1rem', letterSpacing: '1px' }}>RECENT SESSIONS</h3>
              <button className="brand-pill-light" style={{ cursor: 'pointer' }}>
                VIEW ALL HISTORY <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="history-grid-compact">
                {history.length > 0 ? (
                  history.slice(0, 2).map((session) => (
                      <div 
                        key={session._id} 
                        className="history-card-small glass-card fade-in"
                        onClick={() => navigate("/interview/report", { state: { history: session.answers, config: session } })}
                      >
                          <div className="hc-header">
                              <div className="status-indicator">
                                <div className="status-dot-active"></div>
                                <span>{session.status?.toUpperCase() || "COMPLETED"}</span>
                              </div>
                              <span className="hc-date">{new Date(session.created_at).toLocaleDateString()}</span>
                          </div>

                          <h4 className="hc-role-text">{session.role?.toUpperCase() || "ML ENGINEER"}</h4>
                          
                          <div className="hc-footer">
                              <div className="hc-score-tag">
                                <Zap size={14} />
                                <span>{session.overall_score || 0}%</span>
                              </div>
                              <button className="hc-del-btn" onClick={(e) => handleDelete(e, session._id)}>
                                <Trash2 size={14} />
                              </button>
                          </div>
                      </div>
                  ))
                ) : (
                  <div className="empty-history glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                    <Inbox size={24} className="text-muted mb-2" />
                    <p className="text-muted">No recent sessions found.</p>
                  </div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;