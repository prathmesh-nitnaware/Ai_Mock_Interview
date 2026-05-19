import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Shield, 
  Search, 
  AlertCircle,
  Mail,
  CheckCircle,
  HelpCircle,
  X,
  Clock,
  Trophy,
  Compass,
  Mic,
  Terminal,
  FileText,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import './AdminUsersList.css';

const AdminUsersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersList, setUsersList] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Popup modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  // Client-side Admin guard
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.client.get('/api/admin/users');
      setUsersList(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users list:', err);
      setError(err.message || 'Could not fetch candidate profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsersData();
    }
  }, [user]);

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
    return null;
  }

  // Filter users by search query
  const filteredUsers = usersList.filter((u) => {
    return (
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  // Helper: SVG Line coordinates for score progression
  const renderScoreLinePath = (scores) => {
    if (!scores || scores.length === 0) return '';
    const width = 260;
    const height = 80;
    const points = scores.map((s, idx) => {
      const x = (idx / Math.max(scores.length - 1, 1)) * width;
      const y = height - (s.score / 100) * height;
      return `${x},${y}`;
    });
    if (scores.length === 1) {
      return `M 0,${height - (scores[0].score / 100) * height} L ${width},${height - (scores[0].score / 100) * height}`;
    }
    return `M ${points.join(' L ')}`;
  };

  const renderScoreAreaPath = (scores) => {
    if (!scores || scores.length === 0) return '';
    const width = 260;
    const height = 80;
    const linePath = renderScoreLinePath(scores);
    return `${linePath} L ${width},${height} L 0,${height} Z`;
  };

  // Helper: SVG Bar heights for engagement chart
  const renderEngagementBars = (activity) => {
    if (!activity || activity.length === 0) return null;
    const maxCount = Math.max(...activity.map(a => a.count), 1);
    return activity.map((day, idx) => {
      const barHeight = Math.max((day.count / maxCount) * 60, 4); // Min 4px height
      return (
        <div key={idx} className="user-activity-bar-item">
          <div className="bar-wrapper">
            <div className="bar-fill" style={{ height: `${barHeight}px` }} title={`${day.count} activities`}></div>
          </div>
          <span className="bar-day-lbl">{day.date}</span>
        </div>
      );
    });
  };

  return (
    <div className="admin-users-page fade-in">
      <div className="noise-bg"></div>
      <div className="ambient-glow"></div>

      <div className="admin-users-content">
        
        {/* --- BACK NAVIGATION HEADER --- */}
        <div className="back-navigation">
          <Link to="/admin" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <section className="admin-users-header">
          <div>
            <div className="brand-pill-light mb-4">
              <Shield size={14} />
              <span>Full Directory View</span>
            </div>
            <h1 className="admin-users-title">Candidates Log</h1>
            <p className="admin-users-subtitle text-muted font-sans">
              Complete searchable register of candidate enrollment details, problem-solving analytics, and average mock scores.
            </p>
          </div>
        </section>

        {/* --- ERROR ALERT --- */}
        {error && (
          <div className="glass-card mb-6" style={{ padding: '1.25rem', borderColor: 'var(--danger-border)', background: 'var(--danger-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* --- SEARCH & TABLE DIRECTORY --- */}
        <section className="users-directory-section glass-card">
          
          <div className="table-controls-header-directory">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.5px' }}>Candidate Directory</h3>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Click name to inspect user activity logs and engagement graphs</span>
          </div>

          <div className="directory-search-bar-wrapper">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search candidates by name or email ID..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="directory-loading">
              <div className="loading-spinner"></div>
              <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Loading candidate directory...</p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Candidate Details</th>
                    <th>Email Address</th>
                    <th>Problems Solved</th>
                    <th>Mock Interview Score</th>
                    <th>Mock Sessions</th>
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
                          <span className="problems-solved-badge">
                            <Terminal size={12} />
                            <span>{u.problems_solved || 0} Solved</span>
                          </span>
                        </td>
                        <td>
                          <div className="mock-score-cell">
                            <Trophy size={14} style={{ color: (u.average_score || 0) >= 70 ? '#eab308' : 'var(--text-tertiary)' }} />
                            <span style={{ fontWeight: 700 }}>
                              {u.average_score > 0 ? `${u.average_score}%` : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="sessions-count">
                            {u.interviews_count || 0} Taken
                          </span>
                        </td>
                        <td>
                          {u.onboarding_completed ? (
                            <span className="status-pill verified">
                              <span className="status-dot"></span>
                              <span>Onboarded</span>
                            </span>
                          ) : (
                            <span className="status-pill unverified">
                              <span className="status-dot"></span>
                              <span>Pending Profile</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="no-users-found">
                          <HelpCircle size={28} className="text-muted mb-2" />
                          <p>No candidates found matching the criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
                    <span className="role-badge candidate" style={{ marginRight: '8px' }}>
                      Candidate
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

                  {/* POPUP ENGAGEMENT & GRAPHS SECTION */}
                  <div className="modal-graphs-grid">
                    
                    {/* Score Progression graph */}
                    <div className="modal-graph-card glass-card">
                      <h4 className="modal-graph-title">
                        <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
                        <span>Mock Score Progression</span>
                      </h4>
                      <div className="mg-body">
                        {userActivity.scores_chart && userActivity.scores_chart.length > 0 ? (
                          <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                            <svg viewBox="0 0 260 80" width="100%" height="80" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                              <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
                                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
                                </linearGradient>
                              </defs>
                              <path d={renderScoreAreaPath(userActivity.scores_chart)} fill="url(#scoreGrad)" />
                              <path d={renderScoreLinePath(userActivity.scores_chart)} fill="none" stroke="var(--accent)" strokeWidth="2" />
                            </svg>
                            <div className="mg-axis-scores">
                              <span>Initial</span>
                              <span>Latest ({userActivity.scores_chart[userActivity.scores_chart.length - 1].score}%)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mg-empty">No mock scores logged.</div>
                        )}
                      </div>
                    </div>

                    {/* Weekly Engagement Bars */}
                    <div className="modal-graph-card glass-card">
                      <h4 className="modal-graph-title">
                        <Activity size={14} style={{ color: '#ec4899' }} />
                        <span>7-Day Engagement</span>
                      </h4>
                      <div className="mg-body bar-layout">
                        {userActivity.activity_chart && userActivity.activity_chart.some(d => d.count > 0) ? (
                          <div className="activity-bars-container">
                            {renderEngagementBars(userActivity.activity_chart)}
                          </div>
                        ) : (
                          <div className="mg-empty">No action logs found this week.</div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Activity Log Timeline */}
                  <div className="timeline-container" style={{ marginTop: '1.5rem' }}>
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

export default AdminUsersList;
