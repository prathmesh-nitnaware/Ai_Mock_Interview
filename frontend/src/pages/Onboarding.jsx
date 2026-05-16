import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, GraduationCap, Briefcase, Target, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="onboarding-root fade-in-up">
      <div className="ambient-glow-brand"></div>
      
      <div className="onboarding-container glass-panel">
        <div className="form-header text-center mb-8">
          <div className="brand-pill-light mx-auto mb-4">
             <Sparkles size={14} className="text-indigo-light" />
             <span>PROFILE SETUP</span>
          </div>
          <h2>Welcome, {user?.name?.split(' ')[0] || 'Candidate'}!</h2>
          <p className="text-muted mt-2">Before we drop you into the training environment, we need to calibrate your AI settings. Just 3 quick questions.</p>
        </div>

        {error && (
          <div className="error-pill shake-animation mb-6 text-center">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="onboarding-form">
          
          <div className="question-block glass-panel-inner">
            <label className="question-label">
                <GraduationCap size={18} className="text-indigo" />
                <span>1. What is your highest level of education?</span>
            </label>
            <input 
                type="text" 
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="E.g. B.S. Computer Science, Self-Taught, Master's Degree"
                className="input-glass mt-3 w-full"
            />
          </div>

          <div className="question-block glass-panel-inner mt-6">
            <label className="question-label">
                <Briefcase size={18} className="text-success" />
                <span>2. What is your current job role or status?</span>
            </label>
            <input 
                type="text" 
                name="current_job"
                value={formData.current_job}
                onChange={handleChange}
                placeholder="E.g. College Student, Junior Developer, Unemployed"
                className="input-glass mt-3 w-full"
            />
          </div>

          <div className="question-block glass-panel-inner mt-6">
            <label className="question-label">
                <Target size={18} className="text-warning" />
                <span>3. What target job role are you preparing for?</span>
            </label>
            <input 
                type="text" 
                name="target_job"
                value={formData.target_job}
                onChange={handleChange}
                placeholder="E.g. Frontend Engineer, Product Manager"
                className="input-glass mt-3 w-full"
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="btn-glow-submit w-full mt-8"
            disabled={loading}
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> SAVING...
                </span>
            ) : (
                <>Complete Setup <ArrowRight size={18} className="ml-2"/></>
            )}
          </Button>

        </form>
      </div>
    </div>
  );
};

export default Onboarding;
