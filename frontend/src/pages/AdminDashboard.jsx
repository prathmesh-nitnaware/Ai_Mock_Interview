import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Shield, 
  Users, 
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
  FileText,
  ChevronRight,
  Activity,
  Cpu,
  Zap,
  DollarSign,
  Layers,
  RefreshCw
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
  
  // AI Metrics state (Phase 12)
  const [aiPeriod, setAiPeriod] = useState('today');
  const [aiMetrics, setAiMetrics] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

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

      // Fetch AI telemetry
      await fetchAiMetrics(aiPeriod);

    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'An error occurred while loading administration panel data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiMetrics = async (period) => {
    try {
      setAiLoading(true);
      const res = await api.client.get(`/api/admin/ai/metrics?period=${period}`);
      setAiMetrics(res.data);
    } catch (err) {
      console.warn('Failed to load AI metrics:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setAiPeriod(newPeriod);
    fetchAiMetrics(newPeriod);
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
    return null;
  }

  // Candidates only: filter locally just in case
  const candidateUsers = usersList.filter(u => u.role !== 'admin');
  
  // Limit to 5 users for preview
  const previewUsers = candidateUsers.slice(0, 5);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper for computing line coordinates for the main SVG user growth chart
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

  // Helper: SVG Line coordinates for score progression inside popup
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

  // Helper: SVG Bar heights for engagement chart inside popup
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
          
          <div className="chart-card">
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
                        <stop offset="0%" stopColor="var(--color-admin)" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="var(--color-admin)" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="0" x2="800" y2="0" stroke="var(--color-border)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="800" y2="50" stroke="var(--color-border)" strokeWidth="1" />
                    <line x1="0" y1="100" x2="800" y2="100" stroke="var(--color-border)" strokeWidth="1" />
                    <line x1="0" y1="150" x2="800" y2="150" stroke="var(--color-border)" strokeWidth="1" />
                    
                    <path d={renderAreaChartPath(analytics.chart_data, 'users')} fill="url(#chartGradient)" />
                    <path d={renderLineChartPath(analytics.chart_data, 'users')} fill="none" stroke="var(--color-admin)" strokeWidth="2.5" />
                  </svg>
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

        {/* --- AI COST & TELEMETRY CONTROL CENTER (Phase 12) --- */}
        <section className="ai-control-section">
          <div className="ai-header-bar">
            <div className="ai-header-title">
              <Cpu size={20} style={{ color: 'var(--color-admin)' }} />
              <h2>AI Cost & Telemetry Control Center</h2>
              {aiMetrics && (
                <span className="ai-data-status-pill">
                  {aiMetrics.data_status || 'Measured'}
                </span>
              )}
            </div>

            <div className="ai-period-selector">
              {['today', 'week', 'month', 'all'].map((p) => (
                <button
                  key={p}
                  className={`ai-period-btn ${aiPeriod === p ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(p)}
                >
                  {p === 'today' ? 'Today' : p === 'week' ? '7 Days' : p === 'month' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {aiMetrics ? (
            <div>
              {/* Cost Anomaly Alert Banner */}
              {aiMetrics.anomalies && aiMetrics.anomalies.length > 0 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {aiMetrics.anomalies.map((anom, idx) => (
                    <div key={idx} style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>{anom.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stat Cards Grid */}
              <div className="ai-stats-grid">
                <div className="ai-stat-card">
                  <span className="ai-stat-lbl">AI Invocations</span>
                  <span className="ai-stat-val">{aiMetrics.total_calls || 0}</span>
                  <span className="ai-stat-sub">Cache Hits: {aiMetrics.cache_hit_rate}%</span>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-lbl">Total Tokens</span>
                  <span className="ai-stat-val">{(aiMetrics.total_tokens || 0).toLocaleString()}</span>
                  <span className="ai-stat-sub">In: {(aiMetrics.total_input_tokens || 0).toLocaleString()} | Out: {(aiMetrics.total_output_tokens || 0).toLocaleString()}</span>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-lbl">Estimated Cost</span>
                  <span className="ai-stat-val">${(aiMetrics.total_estimated_cost || 0).toFixed(4)}</span>
                  <span className="ai-stat-sub">Avg/Interview: ${(aiMetrics.average_cost_per_interview || 0).toFixed(4)}</span>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-lbl">Tokens / Interview</span>
                  <span className="ai-stat-val">{(aiMetrics.average_tokens_per_interview || 0).toLocaleString()}</span>
                  <span className="ai-stat-sub">In: {(aiMetrics.average_input_tokens_per_interview || 0).toLocaleString()} | Out: {(aiMetrics.average_output_tokens_per_interview || 0).toLocaleString()}</span>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-lbl">AI Latency Profile</span>
                  <span className="ai-stat-val">{aiMetrics.average_latency_ms || 0} ms</span>
                  <span className="ai-stat-sub">p50: {aiMetrics.p50_latency_ms || 0}ms | p95: {aiMetrics.p95_latency_ms || 0}ms | p99: {aiMetrics.p99_latency_ms || 0}ms</span>
                </div>

                <div className="ai-stat-card">
                  <span className="ai-stat-lbl">Reliability & Safety</span>
                  <span className="ai-stat-val">{100 - (aiMetrics.fallback_rate || 0)}%</span>
                  <span className="ai-stat-sub">Retries: {aiMetrics.retry_rate}% | Fallbacks: {aiMetrics.fallback_rate}% | Trunc: {aiMetrics.truncation_rate}%</span>
                </div>
              </div>

              {/* Breakdowns Grid */}
              <div className="ai-breakdown-grid">
                {/* Request Type Breakdown & Output Ceilings */}
                <div className="ai-breakdown-card">
                  <h3>Output Ceilings & Token Utilization</h3>
                  {aiMetrics.by_request_type && aiMetrics.by_request_type.length > 0 ? (
                    aiMetrics.by_request_type.map((item, idx) => (
                      <div key={idx} className="ai-breakdown-item">
                        <div>
                          <span className="ai-breakdown-name">{item.request_type}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>
                            Ceiling: {item.configured_ceiling} | Avg Out: {item.avg_output_tokens} | p95: {item.p95_output_tokens}
                          </span>
                        </div>
                        <div className="ai-breakdown-stats">
                          <span style={{ fontWeight: 700, color: item.ceiling_utilization_pct > 80 ? '#f59e0b' : 'var(--color-admin)' }}>
                            {item.ceiling_utilization_pct}% Util
                          </span>
                          <span>${(item.cost || 0).toFixed(4)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No AI calls recorded for this period.</p>
                  )}
                </div>

                {/* Prompt Versioning & Quality Breakdown */}
                <div className="ai-breakdown-card">
                  <h3>Prompt Versioning & Governance</h3>
                  {aiMetrics.by_prompt_version && aiMetrics.by_prompt_version.length > 0 ? (
                    aiMetrics.by_prompt_version.map((item, idx) => (
                      <div key={idx} className="ai-breakdown-item">
                        <div>
                          <span className="ai-breakdown-name">{item.prompt_version}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>{item.request_type}</span>
                        </div>
                        <div className="ai-breakdown-stats">
                          <span>Avg: {item.avg_tokens} tok</span>
                          <span>Failures: {item.validation_failures}</span>
                          <span>{item.count} runs</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No prompt version telemetry logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Gathering AI telemetry data...</p>
          )}
        </section>

        {/* --- ERROR ALERT --- */}
        {error && (
          <div className="mb-6" style={{ padding: '1.25rem', borderColor: 'var(--color-error)', background: 'var(--color-error-bg)', display: 'flex', gap: '0.75rem', alignItems: 'center', borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
            <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* --- USERS DIRECTORY PREVIEW (Max 5 Candidates) --- */}
        <section className="users-table-section">
          
          <div className="table-controls-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.5px' }}>Candidates Overview</h3>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Displaying the 5 most recent registrations. Click a candidate name to view stats.</span>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Candidate Details</th>
                  <th>Email ID</th>
                  <th>Problems Solved</th>
                  <th>Mock Interview Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewUsers.length > 0 ? (
                  previewUsers.map((u) => (
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
                    <td colSpan="5">
                      <div className="no-users-found">
                        <HelpCircle size={28} className="text-muted mb-2" />
                        <p>No registered candidates found in the database.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- SEE MORE LINK BUTTON --- */}
          {candidateUsers.length > 5 && (
            <div className="see-more-wrapper">
              <Link to="/admin/users" className="see-more-btn">
                <span>See More Candidates</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          )}

        </section>

      </div>

      {/* --- ACTIVITY POPUP / ENGAGEMENT MODAL --- */}
      {selectedUser && (
        <div className="admin-modal-overlay fade-in">
          <div className="admin-modal-card">
            
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

                  <div className="profile-completeness-row">
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
                    <div className="modal-graph-card">
                      <h4 className="modal-graph-title">
                        <TrendingUp size={14} style={{ color: 'var(--color-admin)' }} />
                        <span>Mock Score Progression</span>
                      </h4>
                      <div className="mg-body">
                        {userActivity.scores_chart && userActivity.scores_chart.length > 0 ? (
                          <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                            <svg viewBox="0 0 260 80" width="100%" height="80" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                              <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--color-admin)" stopOpacity="0.25"/>
                                  <stop offset="100%" stopColor="var(--color-admin)" stopOpacity="0.0"/>
                                </linearGradient>
                              </defs>
                              <path d={renderScoreAreaPath(userActivity.scores_chart)} fill="url(#scoreGrad)" />
                              <path d={renderScoreLinePath(userActivity.scores_chart)} fill="none" stroke="var(--color-admin)" strokeWidth="2" />
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
                    <div className="modal-graph-card">
                      <h4 className="modal-graph-title">
                        <Activity size={14} style={{ color: 'var(--color-admin)' }} />
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
                      <div className="empty-timeline">
                        <Compass size={24} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>No activity records found for this user.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-close-action" onClick={() => setSelectedUser(null)}>
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
