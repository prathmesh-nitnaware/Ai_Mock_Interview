import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, ArrowRight, Target, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import './ResumeUpload.css';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please attach a PDF document first.');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please specify a target role for accurate ATS parsing.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', targetRole);

    try {
      const response = await api.scoreResume(formData);
      navigate('/resume/result', {
        state: {
          results: response,
          job_role: targetRole,
        },
      });
    } catch (err) {
      console.error('Upload/Processing Error:', err);
      setError(err.response?.data?.error || 'Resume analysis failed. Please verify the document format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-page">
      <div className="resume-upload-container">
        <div className="resume-upload-header">
          <div className="resume-badge-tag">
            <Target size={13} />
            <span>PLACEMENT ATS SCANNER</span>
          </div>
          <h1 className="resume-upload-title">Resume ATS Scanner</h1>
          <p className="resume-upload-subtitle">
            Upload your resume PDF and specify your target engineering role to scan keyword match rates, missing technical competencies, and impact bullet formatting.
          </p>
        </div>

        <div className="resume-upload-card">
          {error && (
            <div className="resume-error-banner">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Target Role Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a0a0b5' }}>
              Target Placement Role
            </label>
            <input
              type="text"
              className="auth-input-field"
              placeholder="e.g. Backend Engineer, Full Stack Developer, SRE"
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                if (error) setError(null);
              }}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          {/* File Dropzone / Selected file preview */}
          {!file ? (
            <label className="resume-dropzone">
              <UploadCloud size={36} className="dropzone-icon" />
              <span className="dropzone-primary-text">Click to browse or drag PDF here</span>
              <span className="dropzone-secondary-text">PDF format only (Max 5MB)</span>
              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          ) : (
            <div className="file-selected-box">
              <div className="file-selected-info">
                <FileText size={22} style={{ color: '#7c5cfc' }} />
                <div>
                  <div className="file-name-text">{file.name}</div>
                  <div className="file-size-text">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => setFile(null)}
                title="Remove attached file"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn-analyze-resume"
            onClick={handleUpload}
            disabled={loading || !file || !targetRole.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Analyzing Document...
              </>
            ) : (
              <>
                <span>Run ATS Audit</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
