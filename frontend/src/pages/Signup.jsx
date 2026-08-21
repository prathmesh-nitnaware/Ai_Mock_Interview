import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Sparkles, CheckCircle2, Layers, Target, ShieldCheck } from 'lucide-react';
import './Login.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, submitting } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('All fields are required.');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const isLongEnough = formData.password.length >= 8;

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !isLongEnough) {
      setError('Please ensure your password meets all requirements below.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const signupPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    try {
      const result = await signup(signupPayload);

      if (result && result.success) {
        setError(null);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        alert('Account created successfully! You can now log in.');
        navigate('/login');
      } else {
        setError(result?.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError(err?.error || 'A connection error occurred. Please verify backend connectivity.');
    }
  };

  const isLenMet = formData.password.length >= 8;
  const isUpperMet = /[A-Z]/.test(formData.password);
  const isLowerMet = /[a-z]/.test(formData.password);
  const isNumMet = /\d/.test(formData.password);
  const isMatchMet = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

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
              Start your placement preparation journey.
            </h1>
            <p className="auth-hero-subtitle" style={{ marginTop: '0.6rem' }}>
              Create your account to unlock personalized mock interviews, resume skill verification, and deep performance feedback.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <Layers size={15} />
              </div>
              <div className="auth-feature-content">
                <span className="auth-feature-heading">Immediate Account Activation</span>
                <p className="auth-feature-desc">
                  Register with any valid email address and access your interview dashboard instantly.
                </p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <Target size={15} />
              </div>
              <div className="auth-feature-content">
                <span className="auth-feature-heading">Resume Skill Grounding</span>
                <p className="auth-feature-desc">
                  Interviewers validate technical technologies and frameworks directly from your resume.
                </p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <ShieldCheck size={15} />
              </div>
              <div className="auth-feature-content">
                <span className="auth-feature-heading">Deterministic 85/15 Scoring</span>
                <p className="auth-feature-desc">
                  Content accuracy and delivery coaching scores are strictly isolated without hardware bias.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Signup Card */}
        <div className="auth-form-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create your account</h2>
            <p className="auth-card-subtitle">
              Set up your candidate profile in under a minute.
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
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <div className="input-icon-slot">
                  <User size={15} />
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="auth-input-field"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <div className="input-with-icon">
                <div className="input-icon-slot">
                  <Mail size={15} />
                </div>
                <input
                  id="signup-email"
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
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="input-with-icon">
                <div className="input-icon-slot">
                  <Lock size={15} />
                </div>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  className="auth-input-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <div className="input-icon-slot">
                  <Lock size={15} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  className="auth-input-field"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Password Validation Requirements */}
            {formData.password.length > 0 && (
              <div className="password-requirements-grid">
                <div className={`req-item ${isLenMet ? 'met' : ''}`}>
                  <CheckCircle2 size={13} />
                  <span>8+ characters</span>
                </div>
                <div className={`req-item ${isUpperMet ? 'met' : ''}`}>
                  <CheckCircle2 size={13} />
                  <span>1 uppercase</span>
                </div>
                <div className={`req-item ${isLowerMet ? 'met' : ''}`}>
                  <CheckCircle2 size={13} />
                  <span>1 lowercase</span>
                </div>
                <div className={`req-item ${isNumMet ? 'met' : ''}`}>
                  <CheckCircle2 size={13} />
                  <span>1 number</span>
                </div>
                <div className={`req-item ${isMatchMet ? 'met' : ''}`} style={{ gridColumn: 'span 2' }}>
                  <CheckCircle2 size={13} />
                  <span>Passwords match</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-card-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-switch-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;