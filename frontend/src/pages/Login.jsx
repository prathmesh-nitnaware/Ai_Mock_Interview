import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Sparkles, Layers, Target, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login, submitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both your email and password.');
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.user && result.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (result.user && result.user.onboarding_completed === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-workspace-container">
        {/* Left Column: Product Value Pillars */}
        <div className="auth-brand-column">
          <Link to="/" className="auth-brand-logo">
            <div className="auth-logo-icon">
              <Sparkles size={18} />
            </div>
            <span className="auth-logo-text">PREP AI</span>
          </Link>

          <div>
            <h1 className="auth-hero-title">
              Practice the interview before the interview.
            </h1>
            <p className="auth-hero-subtitle" style={{ marginTop: '0.6rem' }}>
              Adaptive technical, system design, and behavioral mock interviews calibrated for engineering campus placements.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <Layers size={15} />
              </div>
              <div className="auth-feature-content">
                <span className="auth-feature-heading">5-Stage Adaptive Progression</span>
                <p className="auth-feature-desc">
                  Fundamentals, applied problem solving, deep technical depth, system architecture, and behavioral STAR questions.
                </p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <Target size={15} />
              </div>
              <div className="auth-feature-content">
                <span className="auth-feature-heading">Explainable Performance Audits</span>
                <p className="auth-feature-desc">
                  Objective evidence breakdowns, trade-off analysis, technical gap probing, and vocal delivery coaching.
                </p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <ShieldCheck size={15} />
              </div>
              <div className="auth-feature-content">
                <span className="auth-feature-heading">Role-Specific Placement Tracks</span>
                <p className="auth-feature-desc">
                  Tailored questioning for Backend, Frontend, Full Stack, SRE, and ML/AI engineering roles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Login Card */}
        <div className="auth-form-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Sign in to your account</h2>
            <p className="auth-card-subtitle">
              Enter your placement preparation credentials.
            </p>
          </div>

          {error && (
            <div className="auth-alert-banner">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <div className="input-icon-slot">
                  <Mail size={15} />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="auth-input-field"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <div className="input-icon-slot">
                  <Lock size={15} />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="auth-input-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="auth-options-row">
              <label className="auth-remember-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-card-footer">
            <span>Don't have an account? </span>
            <Link to="/signup" className="auth-switch-link">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;