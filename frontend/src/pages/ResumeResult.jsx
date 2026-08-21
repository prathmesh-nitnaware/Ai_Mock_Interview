import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  FileSearch,
  Zap,
  XCircle,
  FileText,
  Target,
  Layers,
} from 'lucide-react';
import './ResumeResult.css';

const ResumeResult = () => {
  const location = useLocation();

  const results = location.state?.results || null;
  const jobRole = location.state?.job_role || 'Target Role';

  if (!results) {
    return (
      <div className="resume-result-page" style={{ alignItems: 'center' }}>
        <div className="result-header-card" style={{ maxWidth: '500px', margin: '4rem auto', flexDirection: 'column', textAlign: 'center' }}>
          <FileSearch size={40} style={{ color: '#8c8ca0', margin: '0 auto' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>No Resume Audit Data Found</h2>
          <p style={{ fontSize: '0.875rem', color: '#8c8ca0', margin: 0 }}>
            Upload your resume PDF to run a full ATS match analysis against your target placement role.
          </p>
          <Link to="/resume/upload" className="btn-dash-primary" style={{ marginTop: '0.5rem' }}>
            Go to Resume Upload
          </Link>
        </div>
      </div>
    );
  }

  const score = results.score || 0;
  const isGood = score >= 80;
  const isFair = score >= 60 && score < 80;

  const badgeType = isGood ? 'success' : isFair ? 'warning' : 'danger';
  const badgeText = isGood ? 'Strong Match' : isFair ? 'Moderate Match' : 'Action Required';

  return (
    <div className="resume-result-page">
      <div className="resume-result-container">
        {/* Header Card */}
        <div className="result-header-card">
          <div className="result-header-left">
            <div className="result-role-tag">
              <Target size={12} /> {jobRole}
            </div>
            <h1 className="result-title">Resume ATS Match Report</h1>
          </div>

          <Link to="/resume/upload" className="btn-dash-outline">
            <RefreshCw size={13} /> Re-scan Another Resume
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className="result-grid-layout">
          {/* Score Column */}
          <div className="score-overview-card">
            <span style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', color: '#8c8ca0', letterSpacing: '0.04em' }}>
              Overall ATS Match
            </span>

            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {score}%
            </div>

            <div className={`score-badge-pill ${badgeType}`}>
              {badgeText}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#7c7c90', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>
              Calibrated against standard technical job requirements for {jobRole}.
            </p>
          </div>

          {/* Details Column */}
          <div className="details-column">
            {/* Executive Summary */}
            {results.summary && (
              <div className="result-panel">
                <h3 className="result-panel-heading">
                  <Zap size={15} className="result-panel-heading-icon" /> Executive Summary
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#b4b4c8', lineHeight: 1.6, margin: 0 }}>
                  {results.summary}
                </p>
              </div>
            )}

            {/* Extracted Skills */}
            {results.skills && results.skills.length > 0 && (
              <div className="result-panel">
                <h3 className="result-panel-heading">
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Verified Skills Detected ({results.skills.length})
                </h3>
                <div className="skills-tags-wrap">
                  {results.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {results.missing_skills && results.missing_skills.length > 0 && (
              <div className="result-panel">
                <h3 className="result-panel-heading">
                  <AlertTriangle size={15} style={{ color: '#f59e0b' }} /> Recommended Keywords to Add ({results.missing_skills.length})
                </h3>
                <div className="skills-tags-wrap">
                  {results.missing_skills.map((skill, idx) => (
                    <span key={idx} className="missing-tag">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeResult;
