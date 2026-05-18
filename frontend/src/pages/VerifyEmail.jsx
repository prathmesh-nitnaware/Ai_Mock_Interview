import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import './VerifyEmail.css';
import '../styles/theme.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const { API_URL } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
            setStatus('success');
            setMessage('Your email has been successfully verified! You can now log in to your account.');
        } else {
            setStatus('error');
            setMessage(data.error || 'Failed to verify email. The link may have expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Connection error. Please try again later.');
      }
    };

    // Prevent multiple calls in strict mode
    const timeoutId = setTimeout(() => {
        verifyToken();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [token, API_URL]);

  return (
    <div className="verify-root">
      <div className="ambient-glow-brand"></div>
      <div className="noise-overlay"></div>
      
      <div className="verify-card fade-in-up">
        <div className={`verify-icon-wrapper ${status}`}>
          {status === 'loading' && <Loader2 size={40} className="spinner" />}
          {status === 'success' && <CheckCircle size={40} />}
          {status === 'error' && <XCircle size={40} />}
        </div>
        
        <h1 className="verify-title">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified'}
          {status === 'error' && 'Verification Failed'}
        </h1>
        
        <p className="verify-message">{message}</p>
        
        <div className="verify-actions">
          {status === 'loading' ? (
             <p className="text-sm text-gray-400">Please wait while we confirm your account details.</p>
          ) : (
            <Button 
                variant="primary" 
                className="w-full btn-glow-submit"
                onClick={() => navigate('/login')}
            >
                Continue to Login
            </Button>
          )}
        </div>
        
        {status === 'error' && (
          <div className="mt-4">
             <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
                Return to Sign Up
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
