import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, GraduationCap, Briefcase, Target, Loader2, ArrowLeft } from 'lucide-react';
import '../styles/theme.css';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserData, API_URL } = useAuth();
  
  const [formData, setFormData] = useState({
    education: '',
    current_job: '',
    target_job: ''
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleNext = () => {
    if (step === 1 && !formData.education) {
      setError("Please enter your education to continue.");
      return;
    }
    if (step === 2 && !formData.current_job) {
      setError("Please enter your current job to continue.");
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.education || !formData.current_job || !formData.target_job) {
      setError("Please answer all 3 questions to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          onboarding_completed: true
        })
      });

      if (response.ok) {
        updateUserData({
            ...formData,
            onboarding_completed: true
        });
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save details. Please try again.");
      }
    } catch (err) {
      setError("A connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg-glow"></div>
      
      <div className="auth-card fade-in-up" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Progress Indicator */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <div style={{ height: '4px', flex: 1, backgroundColor: step >= 1 ? 'var(--color-primary)' : 'var(--color-bg-surface-hover)', borderRadius: '2px', transition: 'background-color 0.3s ease' }} />
          <div style={{ height: '4px', flex: 1, backgroundColor: step >= 2 ? 'var(--color-primary)' : 'var(--color-bg-surface-hover)', borderRadius: '2px', transition: 'background-color 0.3s ease' }} />
          <div style={{ height: '4px', flex: 1, backgroundColor: step >= 3 ? 'var(--color-primary)' : 'var(--color-bg-surface-hover)', borderRadius: '2px', transition: 'background-color 0.3s ease' }} />
        </div>

        <div className="auth-header">
          <div className="auth-logo">
            <Sparkles size={24} />
          </div>
          <h1>Welcome, {user?.name?.split(' ')[0] || 'Candidate'}!</h1>
          <p>Calibrate your AI settings before you begin.</p>
        </div>

        {error && (
          <div className="badge badge-error" style={{ width: '100%', marginBottom: 'var(--space-4)', padding: 'var(--space-2)' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {step === 1 && (
            <div className="fade-in-up" style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                  <GraduationCap size={18} style={{ color: 'var(--color-primary)' }} />
                  <span>1. What is your highest level of education?</span>
              </label>
              <input 
                  type="text" 
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="E.g. B.S. Computer Science, Self-Taught"
                  className="input"
                  autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="fade-in-up" style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                  <Briefcase size={18} style={{ color: 'var(--color-success)' }} />
                  <span>2. What is your current job role or status?</span>
              </label>
              <input 
                  type="text" 
                  name="current_job"
                  value={formData.current_job}
                  onChange={handleChange}
                  placeholder="E.g. Junior Developer, Unemployed"
                  className="input"
                  autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="fade-in-up" style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                  <Target size={18} style={{ color: 'var(--color-warning)' }} />
                  <span>3. What target job role are you preparing for?</span>
              </label>
              <input 
                  type="text" 
                  name="target_job"
                  value={formData.target_job}
                  onChange={handleChange}
                  placeholder="E.g. Frontend Engineer, Product Manager"
                  className="input"
                  autoFocus
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'auto', paddingTop: 'var(--space-6)' }}>
            {step > 1 && (
              <button 
                type="button" 
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={16} style={{ marginRight: '8px' }}/> Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="btn btn-primary"
                style={{ flex: step === 1 ? '1' : '2' }}
              >
                Continue <ArrowRight size={16} style={{ marginLeft: '8px' }}/>
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 className="animate-spin" size={16} /> SAVING...
                    </span>
                ) : (
                    <>Complete Setup <ArrowRight size={16} style={{ marginLeft: '8px' }}/></>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
