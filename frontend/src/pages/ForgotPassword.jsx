import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';
import './Login.css'; // Reusing login styles for layout
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { API_URL } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Reset link sent to your email.' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send reset link.' });
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
            
            <h1 className="visual-heading">Secure <br/> Recovery.</h1>
            <p className="visual-text">
              Regain access to your Prep AI account. Enter your email to receive a secure password reset link.
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
              <h2>Reset Password</h2>
              <p>Enter your email address to get a reset link.</p>
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
                    type="email"
                    label="EMAIL ADDRESS"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status.type) setStatus({ type: null, message: '' });
                    }}
                    icon={<Mail size={16} />}
                    required
                  />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="btn-glow-submit w-full mt-4" 
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Sending Link..." : <> Send Reset Link <ArrowRight size={18} /> </>}
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

export default ForgotPassword;
