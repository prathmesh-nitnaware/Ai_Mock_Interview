import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, RefreshCw, 
  Sparkles, AlertTriangle, FileSearch, Zap, XCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import '../styles/theme.css';
import './ResumeResult.css';

const ResumeResult = () => {
  const location = useLocation();
  
  // Extract the data passed from the Upload page
  const results = location.state?.results || null;
  const jobRole = location.state?.job_role || 'Target Role';

  // Dynamic UI Helper based on the 0-100 score
  const getScoreTier = (score) => {
    if (score >= 80) return { color: 'success', text: 'Highly Optimized', glow: 'glow-success' };
    if (score >= 60) return { color: 'warning', text: 'Needs Refinement', glow: 'glow-warning' };
    return { color: 'danger', text: 'Critical Gaps Detected', glow: 'glow-danger' };
  };

  // If no data is present (e.g., direct URL access), show empty state
  if (!results) {
    return (
      <div className="result-empty page-container fade-in-up">
        <FileSearch size={48} className="text-muted mb-4" />
        <h1 className="empty-title">No Audit Data Found</h1>
        <p className="empty-desc">Please upload your resume to generate an AI match report.</p>
        <Link to="/resume/upload">
          <Button variant="primary" className="mt-6">Go to Upload</Button>
        </Link>
      </div>
    );
  }

  const tier = getScoreTier(results.score);

  return (
    <div className="result-root page-container">
      
      {/* Ambient Background Glow based on score performance */}
      <div className={`ambient-glow-resume ${tier.glow}`}></div>
      
      {/* HEADER */}
      <div className="result-header fade-in-up">
        <div className="brand-pill">
            <Sparkles size={14} className="text-indigo" />
            <span>AI ATS DIAGNOSTIC</span>
        </div>
        <h1 className="result-title">Audit Report: {jobRole}</h1>
      </div>

      <div className="report-grid fade-in-up delay-100">
        
        {/* SCORE SECTION (Left Column) */}
        <div className={`glass-panel score-section border-${tier.color}`}>
          <div className="score-header">
            <h3 className="panel-heading">Match Accuracy</h3>
          </div>
          
          <div className="score-circle-wrapper">
            <div className={`score-circle text-${tier.color}`}>
              <span className="score-huge">{results.score}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
          
          <div className={`verdict-badge bg-${tier.color}`}>
            {tier.text}
          </div>

          <p className="score-meta mt-4 text-center text-xs text-muted">
            Analyzed via Ollama Deep-Parse Engine
          </p>

          <div className="score-actions mt-6">
            <Link to="/resume/upload" className="w-full">
              <Button variant="secondary" className="btn-glass-outline w-full">
                <RefreshCw size={14} /> RE-SCAN RESUME
              </Button>
            </Link>
          </div>
        </div>

        {/* DETAILS SECTION (Right Column) */}
        <div className="details-grid">
          
          {/* AI Summary Card */}
          <div className="glass-panel full-width">
            <div className="panel-header-flex">
              <Zap size={18} className="text-indigo" />
              <h3 className="panel-heading">Executive Summary</h3>
            </div>
            <p className="summary-text text-muted">
              {results.summary}
            </p>
          </div>

          {/* Core Strengths Card */}
          {results.strengths && results.strengths.length > 0 && (
            <div className="glass-panel">
              <div className="panel-header-flex">
                <CheckCircle2 size={18} className="text-success" />
                <h3 className="panel-heading">Core Strengths</h3>
              </div>
              <ul className="list-glass success">
                {results.strengths.map((strength, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Growth Card */}
          {results.weaknesses && results.weaknesses.length > 0 && (
            <div className="glass-panel">
              <div className="panel-header-flex">
                <AlertTriangle size={18} className="text-danger" />
                <h3 className="panel-heading">Critical Weaknesses</h3>
              </div>
              <ul className="list-glass danger">
                {results.weaknesses.map((weakness, i) => (
                  <li key={i}>
                    <XCircle size={16} />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Keywords Card */}
          {results.missing_keywords && results.missing_keywords.length > 0 && (
            <div className="glass-panel full-width">
              <div className="panel-header-flex">
                <FileSearch size={18} className="text-warning" />
                <h3 className="panel-heading">Missing Keywords</h3>
              </div>
              <div className="tags-container mt-4">
                {results.missing_keywords.map((keyword, i) => (
                  <span key={i} className="danger-pill">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Tips Card */}
          <div className="glass-panel full-width">
            <div className="panel-header-flex">
              <AlertTriangle size={18} className="text-warning" />
              <h3 className="panel-heading">Optimization Strategy</h3>
            </div>
            <div className="suggestions-list">
              {results.improvement_tips?.map((tip, i) => (
                <div key={i} className="suggestion-row">
                  <ArrowRight size={16} className="text-indigo shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA: Next Step - Interview */}
          <div className="glass-panel full-width highlight-panel">
             <div className="cta-content-flex">
                <div className="cta-text">
                  <h3 className="panel-heading">Next Phase: Simulation</h3>
                  <p className="text-muted text-sm">Practice an AI interview based on your parsed resume content.</p>
                </div>
                <Link 
                  to="/interview/setup" 
                  state={{ resume_text: results.extracted_text }}
                >
                  <Button variant="primary" className="btn-glow-indigo">
                    Start Mock Interview <CheckCircle2 size={16} className="ml-2" />
                  </Button>
                </Link>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeResult;
