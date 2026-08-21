import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import './Onboarding.css';

const STEPS = [
  { id: 1, label: 'Education', title: 'Highest Level of Education' },
  { id: 2, label: 'Current Status', title: 'Current Role or Academic Status' },
  { id: 3, label: 'Target Role', title: 'Target Placement Role' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserData, API_URL } = useAuth();

  const [formData, setFormData] = useState({
    education: '',
    current_job: '',
    target_job: '',
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (step === 1 && !formData.education.trim()) {
      setError('Please specify your education background to continue.');
      return;
    }
    if (step === 2 && !formData.current_job.trim()) {
      setError('Please specify your current role or status to continue.');
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
    if (e) e.preventDefault();
    if (!formData.education.trim() || !formData.current_job.trim() || !formData.target_job.trim()) {
      setError('Please answer all 3 questions to complete your profile setup.');
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          onboarding_completed: true,
        }),
      });

      if (response.ok) {
        updateUserData({
          ...formData,
          onboarding_completed: true,
        });
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save profile details. Please try again.');
      }
    } catch (err) {
      setError('A connection error occurred. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentStepValid = () => {
    if (step === 1) return formData.education.trim().length > 0;
    if (step === 2) return formData.current_job.trim().length > 0;
    if (step === 3) return formData.target_job.trim().length > 0;
    return false;
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Candidate';

  return (
    <div className="onboarding-workspace-page">
      {/* Top Chrome Header */}
      <header className="onboarding-chrome-header">
        <div className="onboarding-brand">
          <div className="onboarding-brand-icon">P</div>
          <span>PREP AI</span>
        </div>
        <div className="onboarding-step-counter">
          Step {step} of 3
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="onboarding-content-container">
        {/* Segmented Progress Strip */}
        <div className="onboarding-progress-segments">
          {STEPS.map((s) => {
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            return (
              <div
                key={s.id}
                className={`progress-segment ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
              >
                <div className="progress-segment-bar"></div>
                <span className="progress-segment-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Page Introduction */}
        <div className="onboarding-intro-group">
          <h1 className="onboarding-main-title">
            Welcome, {userName}. Set up your profile.
          </h1>
          <p className="onboarding-main-desc">
            A few quick details help PrepAI tailor your adaptive technical, system design, and behavioral mock interviews.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="onboarding-error-banner">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Question Workspace Panel */}
        <form
          onSubmit={step === 3 ? handleSubmit : handleNext}
          className="onboarding-question-panel"
        >
          {/* STEP 1: EDUCATION */}
          {step === 1 && (
            <>
              <div className="question-meta-row">
                <span className="question-step-badge">STEP 01</span>
                <GraduationCap size={16} style={{ color: '#7c5cfc' }} />
              </div>

              <div>
                <h2 className="question-title-text">What is your highest level of education?</h2>
                <p className="question-helper-desc">
                  Helps calibrate foundational theory and CS fundamental questions.
                </p>
              </div>

              <div className="onboarding-field-group">
                <label className="onboarding-input-label" htmlFor="education-input">
                  Degree or Academic Background
                </label>
                <input
                  id="education-input"
                  type="text"
                  name="education"
                  className="onboarding-text-input"
                  placeholder="e.g. B.Tech Computer Science, B.S. IT, Self-Taught"
                  value={formData.education}
                  onChange={handleChange}
                  autoFocus
                  required
                />
                <p className="onboarding-input-hint">
                  You can specify your university degree, diploma, or self-directed coursework.
                </p>
              </div>
            </>
          )}

          {/* STEP 2: CURRENT STATUS */}
          {step === 2 && (
            <>
              <div className="question-meta-row">
                <span className="question-step-badge">STEP 02</span>
                <Briefcase size={16} style={{ color: '#7c5cfc' }} />
              </div>

              <div>
                <h2 className="question-title-text">What is your current role or status?</h2>
                <p className="question-helper-desc">
                  Allows the interviewer to set appropriate technical expectation levels.
                </p>
              </div>

              <div className="onboarding-field-group">
                <label className="onboarding-input-label" htmlFor="job-input">
                  Current Role or Status
                </label>
                <input
                  id="job-input"
                  type="text"
                  name="current_job"
                  className="onboarding-text-input"
                  placeholder="e.g. Final Year Student, Intern, Junior Developer"
                  value={formData.current_job}
                  onChange={handleChange}
                  autoFocus
                  required
                />
                <p className="onboarding-input-hint">
                  Specify whether you are a college student, graduate, or currently working.
                </p>
              </div>
            </>
          )}

          {/* STEP 3: TARGET ROLE */}
          {step === 3 && (
            <>
              <div className="question-meta-row">
                <span className="question-step-badge">STEP 03</span>
                <Target size={16} style={{ color: '#7c5cfc' }} />
              </div>

              <div>
                <h2 className="question-title-text">What target job role are you preparing for?</h2>
                <p className="question-helper-desc">
                  Determines your default mock interview questions, ATS skills, and coding tracks.
                </p>
              </div>

              <div className="onboarding-field-group">
                <label className="onboarding-input-label" htmlFor="target-input">
                  Target Placement Role
                </label>
                <input
                  id="target-input"
                  type="text"
                  name="target_job"
                  className="onboarding-text-input"
                  placeholder="e.g. Backend Software Engineer, Full Stack Developer, SRE"
                  value={formData.target_job}
                  onChange={handleChange}
                  autoFocus
                  required
                />
                <p className="onboarding-input-hint">
                  You can change or add multiple target roles anytime in your profile settings.
                </p>
              </div>
            </>
          )}

          {/* Action Button Row */}
          <div className="onboarding-action-row">
            {step > 1 ? (
              <button
                type="button"
                className="btn-onboarding-back"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="submit"
                className="btn-onboarding-continue"
                disabled={!isCurrentStepValid()}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-onboarding-continue"
                disabled={loading || !isCurrentStepValid()}
                style={{ minWidth: '180px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default Onboarding;
