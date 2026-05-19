import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login, submitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where they came from, or dashboard by default
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    // Calls the backend via AuthContext
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
      setError(result.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-root">
      <div className="login-split">
        
        {/* --- Left Side: Visual / Value Prop --- */}
        <div className="login-visual">
          <div className="ambient-glow-brand"></div>
          <div className="noise-overlay"></div>
          
          <div className="visual-content fade-in-up">
            <div className="brand-pill-light mb-6">
              <Sparkles size={14} className="text-indigo-light" />
              <span>PREP AI 2.0</span>
            </div>
            
            <h1 className="visual-heading">Resume <br/> Excellence.</h1>
            <p className="visual-text">
              Log back in to continue your personalized interview training sessions and review your ATS performance metrics.
            </p>

            <ul className="value-props-list mt-8">
              <li><CheckCircle2 size={18} className="text-success" /> Track Progression History</li>
              <li><CheckCircle2 size={18} className="text-success" /> Connect Global Resume Vault</li>
              <li><CheckCircle2 size={18} className="text-success" /> Review Actionable AI Feedback</li>
            </ul>
          </div>
          
          <div className="visual-footer fade-in-up delay-200">
            <span>SECURE ENCLAVE</span>
            <span>SYSTEM.ONLINE</span>
          </div>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="login-form-container">
          <div className="ambient-glow-mobile"></div>

          {/* Glassmorphism Container */}
          <div className="glass-login-card fade-in-up delay-200">
            
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Access your dashboard and resume your training.</p>
            </div>

            {error && (
              <div className="error-pill shake-animation">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-wrapper">
                  <InputField
                    type="email"
                    label="EMAIL ADDRESS"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail size={16} />}
                    required
                  />
              </div>
              
              <div className="input-wrapper">
                  <InputField
                    type="password"
                    label="PASSWORD"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<Lock size={16} />}
                    required
                  />
              </div>

              <div className="form-options">
                <label className="custom-checkbox">
                  <input type="checkbox" /> 
                  <span className="checkmark"></span>
                  <span className="cb-label">Remember me for 30 days</span>
                </label>
                <Link to="/forgot-password" className="link-hover-glow">Forgot Password?</Link>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="btn-glow-submit w-full mt-4" 
                isLoading={submitting}
                disabled={submitting}
              >
                {submitting ? "Authenticating..." : <> Secure Sign In <ArrowRight size={18} /> </>}
              </Button>
            </form>

            <div className="login-footer">
              <p>Don't have an account? <Link to="/signup" className="link-highlight">Create one now</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;