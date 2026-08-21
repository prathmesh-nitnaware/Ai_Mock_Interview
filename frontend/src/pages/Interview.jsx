import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Code2,
  Users,
  Settings,
  AlertCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';
import './Interview.css';

const Interview = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [fetchingResume, setFetchingResume] = useState(true);

  useEffect(() => {
    const fetchGlobalResume = async () => {
      try {
        const res = await api.client.get('/api/profile/resume/get');
        if (res.data && res.data.resume_text) {
          setResumeText(res.data.resume_text);
          setResumeName(res.data.resume_filename);
        }
      } catch (err) {
        // No resume uploaded
      } finally {
        setFetchingResume(false);
      }
    };
    fetchGlobalResume();
  }, []);

  const [formData, setFormData] = useState({
    role: 'Backend Software Engineer',
    experience: '0-2 years',
    type: 'Technical',
    difficulty: 'Medium',
    questionCount: 5,
  });

  const handleChange = (e) => {
    setError(false);
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role.trim()) {
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const config = {
        role: formData.role,
        experience: formData.experience,
        focus: formData.type,
        difficulty: formData.difficulty,
        intensity: formData.questionCount,
        resume_context: resumeText,
      };

      const data = await api.initiateInterview(config);

      if (!data.session_id || !data.question) {
        alert('Backend response invalid. Please verify server status.');
        return;
      }

      navigate('/interview/session', {
        state: {
          session_id: data.session_id,
          question: data.question,
          config,
        },
      });
    } catch (err) {
      console.error('Interview Init Error:', err);
      alert(err.message || 'Failed to initialize interview environment.');
    } finally {
      setLoading(false);
    }
  };

  const expOptions = [
    { label: '0–2 YRS', val: '0-2 years' },
    { label: '3–5 YRS', val: '3-5 years' },
    { label: '5+ YRS', val: '5+ years' },
  ];

  const typeOptions = [
    { label: 'Technical', val: 'Technical', icon: <Code2 size={14} /> },
    { label: 'System Design', val: 'System Design', icon: <Settings size={14} /> },
    { label: 'Behavioral', val: 'Behavioral', icon: <Users size={14} /> },
  ];

  const difficultyOptions = [
    { label: 'Standard', val: 'Standard' },
    { label: 'Medium', val: 'Medium' },
    { label: 'Senior', val: 'Senior' },
  ];

  return (
    <div className="interview-setup-page">
      <div className="interview-setup-container">
        {/* Left Column: Pre-Flight Briefing */}
        <div className="setup-briefing-col">
          <div className="setup-badge-tag">
            <Layers size={13} />
            <span>MOCK INTERVIEW SETUP</span>
          </div>

          <div>
            <h1 className="setup-hero-title">Prepare for your mock interview.</h1>
            <p className="setup-hero-desc">
              Calibrate role targeting, technical depth, and session intensity. The interviewer adapts dynamically to your answers across 5 interview stages.
            </p>
          </div>

          {/* 5-Stage Progression Overview */}
          <div className="stage-progression-card">
            <h3 className="stage-card-title">Adaptive 5-Stage Progression</h3>
            <div className="stage-step-list">
              <div className="stage-step-item">
                <span className="stage-num-badge">1</span>
                <span>Technical Fundamentals & Core Theory</span>
              </div>
              <div className="stage-step-item">
                <span className="stage-num-badge">2</span>
                <span>Applied Coding & Practical Scenarios</span>
              </div>
              <div className="stage-step-item">
                <span className="stage-num-badge">3</span>
                <span>Deep Technical Reasoning & Gap Probing</span>
              </div>
              <div className="stage-step-item">
                <span className="stage-num-badge">4</span>
                <span>System Architecture & Trade-Off Analysis</span>
              </div>
              <div className="stage-step-item">
                <span className="stage-num-badge">5</span>
                <span>Behavioral STAR Competency</span>
              </div>
            </div>
          </div>

          {/* Resume Sync Status */}
          <div className="resume-sync-status-box">
            <FileText size={18} style={{ color: resumeName ? '#10b981' : '#8c8ca0', flexShrink: 0 }} />
            <div>
              {resumeName ? (
                <div style={{ color: '#ffffff', fontWeight: 600 }}>
                  Resume Synced ({resumeName})
                </div>
              ) : (
                <div style={{ color: '#8c8ca0' }}>No resume synced (General questions will be used)</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Configuration Form */}
        <div className="setup-config-card">
          <h2 className="config-card-title">Session Configuration</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Target Role Input */}
            <div className="config-group">
              <label className="config-label" htmlFor="role-input">Target Placement Role</label>
              <input
                id="role-input"
                type="text"
                name="role"
                className="auth-input-field"
                placeholder="e.g. Backend Software Engineer"
                value={formData.role}
                onChange={handleChange}
                required
                style={{ paddingLeft: '0.85rem' }}
              />
              {error && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                  Please specify a target role.
                </span>
              )}
            </div>

            {/* Experience Level */}
            <div className="config-group">
              <label className="config-label">Experience Tier</label>
              <div className="button-chip-grid">
                {expOptions.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    className={`config-chip-btn ${formData.experience === opt.val ? 'active' : ''}`}
                    onClick={() => handleSelect('experience', opt.val)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Type */}
            <div className="config-group">
              <label className="config-label">Primary Track Focus</label>
              <div className="button-chip-grid">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    className={`config-chip-btn ${formData.type === opt.val ? 'active' : ''}`}
                    onClick={() => handleSelect('type', opt.val)}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="config-group">
              <label className="config-label">Question Intensity</label>
              <div className="button-chip-grid">
                {[3, 5, 7].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`config-chip-btn ${formData.questionCount === count ? 'active' : ''}`}
                    onClick={() => handleSelect('questionCount', count)}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-launch-interview"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Calibrating Interviewer...
                </>
              ) : (
                <>
                  <span>Enter Diagnostic Lobby</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Interview;
