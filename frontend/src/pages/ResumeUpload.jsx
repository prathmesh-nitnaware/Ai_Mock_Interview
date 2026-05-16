import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, ArrowRight, Target, Loader2 } from 'lucide-react';
import { api } from '../services/api'; 
import '../styles/theme.css';
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
        setError("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please attach a PDF document first.");
      return;
    }
    if (!targetRole.trim()) {
      setError("Please specify a target role for accurate ATS parsing.");
      return;
    }

    setLoading(true);
    setError(null);

    // Prepare Multipart Form Data for Flask
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', targetRole);

    try {
      // 1. Call the backend API (ensure api.scoreResume uses axios.post or fetch)
      // Pass the formData directly
      const response = await api.scoreResume(formData); 
      
      // 2. Navigate to Results page with the real AI data
      navigate('/resume/result', { 
          state: { 
              results: response, // Passing the full AI JSON (score, summary, etc.)
              job_role: targetRole 
          } 
      });

    } catch (err) {
      console.error("Upload/Processing Error:", err);
      setError(err.response?.data?.error || "AI Analysis failed. Please check your Ollama connection.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="upload-root page-container fade-in-up">
      <div className="upload-wrapper">
        
        <div className="upload-header text-center">
          <div className="brand-pill mx-auto mb-4">
             <Target size={14} className="text-indigo" />
             <span>ATS OPTIMIZER</span>
          </div>
          <h1 className="upload-title">Resume Parser</h1>
          <p className="upload-sub">
            Drop your CV into the engine. We'll parse your formatting, extract your impact metrics, map your skills against industry standards, and identify missing keywords, core strengths, and critical weaknesses.
          </p>
        </div>

        <div className="glass-panel upload-panel">
          
          {/* File Dropzone */}
          {!file ? (
            <label className="dropzone-area">
              <UploadCloud size={48} className={`text-indigo mb-4 drop-icon ${loading ? 'animate-bounce' : ''}`} />
              <span className="dz-text">Click to browse or drag PDF here</span>
              <span className="dz-hint">Maximum file size: 5MB</span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleFileChange} 
                disabled={loading}
              />
            </label>
          ) : (
            <div className="file-secured-banner">
              <div className="file-info-flex">
                <FileText size={28} className="text-success" />
                <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              {!loading && (
                <button onClick={() => setFile(null)} className="btn-remove-file" title="Remove file">
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Role Input */}
          <div className="role-input-section mt-8">
              <label className="input-label-glow">
                  <Target size={14}/> TARGET JOB ROLE
              </label>
              <input 
                  type="text" 
                  className="input-glass w-full mt-2"
                  placeholder="E.g. Full Stack Developer, Product Manager"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={loading}
              />
          </div>

          {error && <div className="error-pill mt-4"><X size={16} /> {error}</div>}

          <button 
            onClick={handleUpload} 
            disabled={loading || !file || !targetRole.trim()}
            className="btn-glow-submit w-full mt-8"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} /> ANALYZING WITH OLLAMA...
              </span>
            ) : (
              <>INITIATE SCAN <ArrowRight size={18} /></>
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
