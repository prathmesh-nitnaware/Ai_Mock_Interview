import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  User,
  Mail,
  Briefcase,
  FileText,
  UploadCloud,
  Trash2,
  Save,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeName, setResumeName] = useState(user?.resume_filename || null);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0 });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Software Engineer',
    bio: user?.bio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    website: user?.website || '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const statsRes = await api.client.get('/api/interview/history');
        const historyData = statsRes.data || [];

        if (historyData.length > 0) {
          const total = historyData.length;
          const avg = Math.round(
            historyData.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / total
          );
          setStats({ interviews: total, avgScore: avg });
        }

        const resumeRes = await api.client.get('/api/profile/resume/get');
        if (resumeRes.data && resumeRes.data.resume_filename) {
          setResumeName(resumeRes.data.resume_filename);
        }
      } catch (err) {
        // Resume not found is normal for new profiles
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('resume', file);

    try {
      await api.client.post('/api/profile/resume/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeName(file.name);
    } catch (err) {
      alert('Resume upload failed. Please verify the PDF format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your active resume?')) return;
    try {
      await api.client.delete('/api/profile/resume/delete');
      setResumeName(null);
    } catch (err) {
      alert('Failed to delete resume.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.client.put('/api/profile/update', formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-skeleton-wrapper">
          <div className="profile-header-card" style={{ height: '110px' }}></div>
          <div className="profile-section-panel" style={{ height: '300px' }}></div>
          <div className="profile-section-panel" style={{ height: '200px' }}></div>
        </div>
      </div>
    );
  }

  const initialLetter = formData.name ? formData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Profile Header Summary */}
        <div className="profile-header-card">
          <div className="profile-user-summary">
            <div className="profile-avatar-box">
              {initialLetter}
            </div>
            <div className="profile-user-info">
              <h1 className="profile-user-name">{formData.name || 'Candidate'}</h1>
              <div className="profile-user-meta">
                <span className="profile-role-tag">
                  <Briefcase size={12} /> {formData.role}
                </span>
                <span>{formData.email}</span>
              </div>
            </div>
          </div>

          <div className="profile-stats-summary">
            <div className="profile-stat-box">
              <span className="profile-stat-num">{stats.interviews}</span>
              <span className="profile-stat-lbl">Interviews</span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-num">{stats.avgScore}%</span>
              <span className="profile-stat-lbl">Avg Score</span>
            </div>
          </div>
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="profile-container" style={{ gap: '1.5rem' }}>
          {/* Section 1: Personal & Account Information */}
          <div className="profile-section-panel">
            <div className="panel-header-row">
              <h2 className="panel-heading">
                <User size={16} className="panel-heading-icon" /> Candidate Profile
              </h2>
              <span className="panel-subheading">Personal details and placement links</span>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field-group">
                <label className="field-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  className="field-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Chen"
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  className="field-input"
                  value={formData.email}
                  disabled
                  title="Email cannot be changed directly"
                />
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="profile-role">Target Role</label>
                <input
                  id="profile-role"
                  type="text"
                  name="role"
                  className="field-input"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Backend Software Engineer"
                />
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="profile-github">GitHub Profile</label>
                <input
                  id="profile-github"
                  type="url"
                  name="github"
                  className="field-input"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="profile-linkedin">LinkedIn Profile</label>
                <input
                  id="profile-linkedin"
                  type="url"
                  name="linkedin"
                  className="field-input"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="profile-field-group">
                <label className="field-label" htmlFor="profile-website">Portfolio Website</label>
                <input
                  id="profile-website"
                  type="url"
                  name="website"
                  className="field-input"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.dev"
                />
              </div>

              <div className="profile-field-group full-width">
                <label className="field-label" htmlFor="profile-bio">Bio & Preparation Objective</label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  className="field-textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief summary of your technical focus and placement objectives..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Appearance & Theme Preferences */}
          <div className="profile-section-panel">
            <div className="panel-header-row">
              <h2 className="panel-heading">
                <Palette size={16} className="panel-heading-icon" /> Appearance & Theme
              </h2>
              <span className="panel-subheading">Customize interface theme (Light or Dark mode)</span>
            </div>

            <div className="vault-status-box" style={{ alignItems: 'center' }}>
              <div className="vault-info-col">
                <div className="vault-file-name" style={{ textTransform: 'capitalize' }}>
                  Current Theme: {theme} Mode
                </div>
                <p className="vault-file-desc">
                  Switch between sleek Dark Mode and modern Executive Light Mode anytime.
                </p>
              </div>

              <div className="vault-actions-group">
                <button
                  type="button"
                  className="btn-dash-primary"
                  onClick={toggleTheme}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Resume Vault */}
          <div className="profile-section-panel">
            <div className="panel-header-row">
              <h2 className="panel-heading">
                <FileText size={16} className="panel-heading-icon" /> Placement Resume
              </h2>
              <span className="panel-subheading">Active CV used for interview grounding</span>
            </div>

            <div className="vault-status-box">
              <div className="vault-info-col">
                {resumeName ? (
                  <>
                    <div className="vault-file-name">{resumeName}</div>
                    <p className="vault-file-desc">
                      ✓ Active and synced for adaptive mock interview probing.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="vault-file-name" style={{ color: 'var(--text-tertiary)' }}>No resume uploaded (Optional)</div>
                    <p className="vault-file-desc">
                      Resume upload is optional. Interviews are personalized from your profile and preferences, or upload a PDF to enable resume-grounded skill probing.
                    </p>
                  </>
                )}
              </div>

              <div className="vault-actions-group">
                <label className="btn-dash-primary" style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                  <UploadCloud size={14} />
                  {isUploading ? 'Uploading...' : resumeName ? 'Replace PDF' : 'Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                </label>

                {resumeName && (
                  <button
                    type="button"
                    className="btn-dash-outline"
                    onClick={handleResumeDelete}
                    title="Remove active resume"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="profile-actions-bar">
            {saveSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>
                <CheckCircle2 size={16} /> Changes saved successfully.
              </div>
            )}
            {!saveSuccess && <div></div>}

            <button
              type="submit"
              className="btn-dash-primary"
              disabled={saving}
              style={{ minWidth: '130px' }}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
