import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';
import './Login.css'; // Reusing login styles for layout
import './ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { API_URL } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus({ type: 'error', message: 'Invalid or missing reset token.' });
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.type) setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    
    // Password Strength Validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const isLongEnough = formData.password.length >= 8;
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !isLongEnough) {
      setStatus({ type: 'error', message: 'Password does not meet all requirements' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'Password reset successfully! Redirecting...' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to reset password.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-split">
        
        {/* --- Left Side: Visual --- */}
        <div className="login-visual">
          <div className="ambient-glow-brand"></div>
          <div className="noise-overlay"></div>
          
          <div className="visual-content fade-in-up">
            <div className="brand-pill-light mb-6">
              <Sparkles size={14} className="text-indigo-light" />
              <span>PREP AI 2.0</span>
            </div>
            
            <h1 className="visual-heading">Update <br/> Password.</h1>
            <p className="visual-text">
              Choose a strong, new password to secure your Prep AI account and get back to your interview preparations.
            </p>
          </div>
          
          <div className="visual-footer fade-in-up delay-200">
            <span>SECURE ENCLAVE</span>
            <span>SYSTEM.ONLINE</span>
          </div>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="login-form-container">
          <div className="ambient-glow-mobile"></div>

          <div className="glass-login-card fade-in-up delay-200">
            
            <div className="login-header">
              <h2>Set New Password</h2>
              <p>Please enter your new password below.</p>
            </div>

            {status.type === 'error' && (
              <div className="error-pill shake-animation">
                <AlertCircle size={18} />
                <span>{status.message}</span>
              </div>
            )}
            
            {status.type === 'success' && (
              <div className="success-pill fade-in">
                <CheckCircle2 size={18} />
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-wrapper">
                  <InputField
                    type="password"
                    label="NEW PASSWORD"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<Lock size={16} />}
                    required
                    disabled={!token || status.type === 'success'}
                  />
              </div>
              
              <div className="input-wrapper">
                  <InputField
                    type="password"
                    label="CONFIRM PASSWORD"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={<Lock size={16} />}
                    required
                    disabled={!token || status.type === 'success'}
                  />
              </div>

              {/* Password Feedback */}
              {formData.password.length > 0 && (
                <div className="password-feedback fade-in">
                  <div className={`feedback-item ${formData.password.length >= 8 ? 'met' : ''}`}>
                    <CheckCircle2 size={14} /> <span>At least 8 characters</span>
                  </div>
                  <div className={`feedback-item ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                    <CheckCircle2 size={14} /> <span>One uppercase letter</span>
                  </div>
                  <div className={`feedback-item ${/[a-z]/.test(formData.password) ? 'met' : ''}`}>
                    <CheckCircle2 size={14} /> <span>One lowercase letter</span>
                  </div>
                  <div className={`feedback-item ${/\d/.test(formData.password) ? 'met' : ''}`}>
                    <CheckCircle2 size={14} /> <span>One number</span>
                  </div>
                  <div className={`feedback-item ${formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 ? 'met' : ''}`}>
                    <CheckCircle2 size={14} /> <span>Passwords match</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className="btn-glow-submit w-full mt-4" 
                isLoading={isLoading}
                disabled={isLoading || !token || status.type === 'success'}
              >
                {isLoading ? "Updating..." : <> Update Password <ArrowRight size={18} /> </>}
              </Button>
            </form>

            <div className="login-footer">
              <p>Remembered your password? <Link to="/login" className="link-highlight">Back to Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
