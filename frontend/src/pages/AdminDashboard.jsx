import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Shield, 
  Users, 
  Search, 
  Sparkles, 
  AlertCircle,
  Mail,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  X,
  Clock,
  Trophy,
  Compass,
  Mic,
  Terminal,
  FileText
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    chart_data: []
  });
  const [usersList, setUsersList] = useState([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Popup modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  // Verify Admin privilege on client side
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics
      const analyticsRes = await api.client.get('/api/admin/analytics');
      setAnalytics(analyticsRes.data);

      // Fetch users
      const usersRes = await api.client.get('/api/admin/users');
      setUsersList(usersRes.data.users || []);

    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'An error occurred while loading administration panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  // Handle opening user activity popup
  const handleUserClick = async (targetUser) => {
    setSelectedUser(targetUser);
    setUserActivity(null);
    setPopupError(null);
    setPopupLoading(true);
    
    try {
      const res = await api.client.get(`/api/admin/user/${targetUser._id}/activity`);
      setUserActivity(res.data);
    } catch (err) {
      console.error('Failed to load user activity details:', err);
      setPopupError(err.message || 'Could not fetch activity for this user.');
    } finally {
      setPopupLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Redirecting in useEffect
  }

  // Local searching & filtering
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = 
      roleFilter === 'all' || 
      u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper for computing line coordinates for the SVG charts
  const renderLineChartPath = (data, key) => {
    if (!data || data.length === 0) return '';
    const width = 800;
    const height = 150;
    const maxVal = Math.max(...data.map(d => d[key]), 1) * 1.2;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d[key] / maxVal) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const renderAreaChartPath = (data, key) => {
    if (!data || data.length === 0) return '';
    const width = 800;
    const height = 150;
    const linePath = renderLineChartPath(data, key);
    return `${linePath} L ${width},${height} L 0,${height} Z`;
  };

  if (loading) {
    return (
      <div className="admin-page fade-in">
        <div className="noise-bg"></div>
        <div className="ambient-glow"></div>
        <div className="admin-content">
          <div className="admin-header-section">
            <div>
              <div className="sk-block sk-pill" style={{ width: 140, marginBottom: 14 }}></div>
              <div className="sk-block" style={{ width: 340, height: 50, borderRadius: 8 }}></div>
            </div>
          </div>
          <div className="admin-stats-grid-single" style={{ marginBottom: 40 }}>
            <div className="sk-card" style={{ height: 120 }}></div>
          </div>
          <div className="sk-card" style={{ height: 350 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page fade-in">
      <div className="noise-bg"></div>
      <div className="ambient-glow"></div>

      <div className="admin-content">
        
        {/* --- HEADER --- */}
        <section className="admin-header-section">
          <div>
            <div className="brand-pill-light mb-4">
              <Shield size={14} />
              <span>PrepAI Headquarters</span>
            </div>
            <h1 className="admin-welcome-title">ADMIN PANEL</h1>
            <p className="admin-subtitle text-muted font-sans">Single-page control room for registered users, onboarding progress, and dynamic user activity tracking.</p>
          </div>
        </section>

        {/* --- SYSTEM METRICS (Single Total Users Metric Card) --- */}
        <section className="admin-stats-grid-single">
          <div className="admin-stat-card-single">
            <div className="admin-stat-icon-box users-accent">
              <Users size={24} />
            </div>
            <div className="admin-stat-details">
              <span className="admin-stat-label">Registered Members</span>
              <span className="admin-stat-value">{analytics.total_users}</span>
            </div>
          </div>
        </section>

        {/* --- DATA & GRAPHS ROW (Wide User Growth Chart) --- */}
        <section className="admin-charts-section-wide">
          
          {/* Active Platform Growth over the last 7 days */}
          <div className="chart-card glass-card">
            <div className="chart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} className="chart-icon" />
                <h3 className="chart-title">7-Day Member Growth Trend</h3>
              </div>
              <span className="chart-legend-label">Daily Signups Logged</span>
            </div>
            <div className="chart-body">
              {analytics.chart_data && analytics.chart_data.length > 0 ? (
                <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                  <svg viewBox="0 0 800 150" width="100%" height="150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* SVG gridlines */}
                    <line x1="0" y1="0" x2="800" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    
                    {/* Area path */}
                    <path d={renderAreaChartPath(analytics.chart_data, 'users')} fill="url(#chartGradient)" />
                    {/* Line path */}
                    <path d={renderLineChartPath(analytics.chart_data, 'users')} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  </svg>
                  {/* SVG axis details */}
                  <div className="chart-axis-labels">
                    {analytics.chart_data.map((day, idx) => (
                      <span key={idx}>{day.date}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-chart">Insufficient signup activity.</div>
              )}
            </div>
          </div>

        </section>

        {/* --- ERROR ALERT --- */}
        {error && (
          <div className="glass-card mb-6" style={{ padding: '1.25rem', borderColor: 'var(--danger-border)', background: 'var(--danger-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* --- USERS DIRECTORY --- */}
        <section className="users-table-section glass-card">
          
          <div className="table-controls-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.5px' }}>Registered Candidates</h3>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Click name to inspect user activity details</span>
          </div>

          <div className="table-controls">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search user name or email..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-wrapper">
              <select 
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-initials">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <button 
                              className="user-activity-btn-link"
                              onClick={() => handleUserClick(u)}
                              title="Inspect Activity History"
                            >
                              {u.name || 'Anonymous User'}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Mail size={14} />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'candidate'}`}>
                          {u.role || 'candidate'}
                        </span>
                      </td>
                      <td>
                        {u.is_verified ? (
                          <span className="status-pill verified">
                            <span className="status-dot"></span>
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="status-pill unverified">
                            <span className="status-dot"></span>
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="no-users-found">
                        <HelpCircle size={28} className="text-muted mb-2" />
                        <p>No matching users found in the database.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* --- ACTIVITY POPUP / ENGAGEMENT MODAL --- */}
      {selectedUser && (
        <div className="admin-modal-overlay fade-in">
          <div className="admin-modal-card glass-card">
            
            <div className="modal-header">
              <div className="modal-header-profile">
                <div className="user-avatar-initials modal-avatar">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="modal-title">{selectedUser.name || 'Anonymous User'}</h3>
                  <div className="modal-subtitle">
                    <span className={`role-badge ${selectedUser.role === 'admin' ? 'admin' : 'candidate'}`} style={{ marginRight: '8px' }}>
                      {selectedUser.role}
                    </span>
                    <span>{selectedUser.email}</span>
                  </div>
                </div>
              </div>
              
              <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {popupLoading && (
                <div className="modal-loading">
                  <div className="loading-spinner"></div>
                  <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Gathering candidate metrics...</p>
                </div>
              )}

              {popupError && (
                <div className="modal-error" style={{ textAlign: 'center', padding: '2rem' }}>
                  <AlertCircle size={32} style={{ color: 'var(--danger)', marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{popupError}</p>
                </div>
              )}

              {!popupLoading && !popupError && userActivity && (
                <div className="modal-activity-details">
                  
                  {/* Performance stats mini row */}
                  <div className="modal-stats-grid">
                    
                    <div className="modal-stat-box">
                      <div className="ms-icon-box green-tint">
                        <Mic size={16} />
                      </div>
                      <div className="ms-details">
                        <span className="ms-lbl">Interviews Run</span>
                        <span className="ms-num">{userActivity.stats.total_interviews}</span>
                      </div>
                    </div>

                    <div className="modal-stat-box">
                      <div className="ms-icon-box purple-tint">
                        <Trophy size={16} />
                      </div>
                      <div className="ms-details">
                        <span className="ms-lbl">Avg Score</span>
                        <span className="ms-num">{userActivity.stats.average_score}%</span>
                      </div>
                    </div>

                    <div className="modal-stat-box">
                      <div className="ms-icon-box orange-tint">
                        <Terminal size={16} />
                      </div>
                      <div className="ms-details">
                        <span className="ms-lbl">Dojo Solved</span>
                        <span className="ms-num">{userActivity.stats.coding_challenges_solved} / {userActivity.stats.coding_challenges_submitted}</span>
                      </div>
                    </div>

                  </div>

                  {/* Onboarding & resume status */}
                  <div className="profile-completeness-row glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} style={{ color: userActivity.user.onboarding_completed ? 'var(--success)' : 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        Onboarding: {userActivity.user.onboarding_completed ? 'Completed' : 'Pending profile setup'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: userActivity.stats.has_resume ? '#8b5cf6' : 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: '0.85rem' }}>
                        Resume Sync: {userActivity.stats.has_resume ? `Active (${userActivity.stats.resume_name})` : 'No file uploaded'}
                      </span>
                    </div>
                  </div>

                  {/* Activity Log Timeline */}
                  <div className="timeline-container">
                    <h4 className="timeline-title-head">Live Activity Feed</h4>
                    
                    {userActivity.timeline && userActivity.timeline.length > 0 ? (
                      <div className="timeline-list">
                        {userActivity.timeline.map((event, idx) => (
                          <div className="timeline-event" key={idx}>
                            <div className="te-badge-line">
                              <div className={`te-icon-circle ${event.type}`}>
                                {event.type === 'interview' && <Mic size={12} />}
                                {event.type === 'coding' && <Terminal size={12} />}
                                {event.type === 'resume' && <FileText size={12} />}
                              </div>
                              {idx < userActivity.timeline.length - 1 && <div className="te-line"></div>}
                            </div>
                            
                            <div className="te-content">
                              <div className="te-header">
                                <span className="te-title">{event.title}</span>
                                <div className="te-time">
                                  <Clock size={10} />
                                  <span>{event.date}</span>
                                </div>
                              </div>
                              <p className="te-detail text-muted">{event.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-timeline glass-card">
                        <Compass size={24} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>No activity records found for this user.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-glow-primary modal-close-action" onClick={() => setSelectedUser(null)}>
                Dismiss Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
