import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Award, 
  Zap, 
  Layout, 
  TrendingUp, 
  Activity, 
  Code,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import './CodingReview.css';

const CodingReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { challenge, submission, result } = location.state || {};

    if (!challenge || !result) {
        return (
            <div className="review-root empty-state">
                <div className="glass-card text-center p-12">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Report Unavailable</h2>
                    <p className="text-gray-400 mb-8">We couldn't find the submission data for this session.</p>
                    <button onClick={() => navigate('/coding/dojo')} className="btn-editorial primary">
                        RETURN TO DOJO
                    </button>
                </div>
            </div>
        );
    }

    const qualityScore = result.success ? 94 : 45;
    const isAccepted = result.success;

    return (
        <div className="review-root fade-in">
            <nav className="review-nav">
                <button onClick={() => navigate('/coding/dojo')} className="review-back-btn">
                    <ChevronLeft size={18} />
                    <span>BACK TO DOJO</span>
                </button>
                <div className="nav-brand-mini">PREP<span>AI</span> AUDIT</div>
            </nav>

            <div className="review-container">
                {/* AUDIT HERO */}
                <div className="audit-hero">
                    <div className="ah-left">
                        <div className="challenge-meta">{challenge.category?.toUpperCase()} • {challenge.difficulty?.toUpperCase()}</div>
                        <h1>CODE<br/>AUDIT</h1>
                        <p className="problem-name">{challenge.title}</p>
                    </div>

                    <div className={`audit-score-ring ${isAccepted ? 'accepted' : 'revision'}`}>
                        <span className="score-value">{qualityScore}%</span>
                        <span className="score-label">QUALITY SCORE</span>
                        <div className={`status-badge-audit ${isAccepted ? 'accepted' : 'revision'}`}>
                            {isAccepted ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                            {isAccepted ? 'ACCEPTED' : 'REVISION NEEDED'}
                        </div>
                    </div>
                </div>

                {/* METRICS GRID */}
                <div className="audit-metrics-grid">
                    <div className="audit-metric-card">
                        <div className="amc-header"><Activity size={16}/> LOGIC</div>
                        <div className="amc-value">{isAccepted ? '9.2' : '4.5'} <span className="m-small">/ 10</span></div>
                    </div>
                    <div className="audit-metric-card">
                        <div className="amc-header"><Zap size={16}/> EFFICIENCY</div>
                        <div className="amc-value">{isAccepted ? '8.8' : '3.2'} <span className="m-small">/ 10</span></div>
                    </div>
                    <div className="audit-metric-card">
                        <div className="amc-header"><Layout size={16}/> READABILITY</div>
                        <div className="amc-value">9.5 <span className="m-small">/ 10</span></div>
                    </div>
                    <div className="audit-metric-card">
                        <div className="amc-header"><TrendingUp size={16}/> COMPLEXITY</div>
                        <div className="amc-value">O(N)</div>
                    </div>
                </div>

                <div className="review-split">
                    {/* LEFT: FEEDBACK & PATHWAY */}
                    <div className="review-section-glass">
                        <div className="rs-header"><Award size={18}/> ARCHITECT FEEDBACK</div>
                        <div className="review-feedback-text">
                            <p>{result.feedback}</p>
                        </div>

                        <div className="optimization-pathway">
                            <div className="rs-header" style={{marginTop: '3rem'}}><Layout size={18}/> OPTIMIZATION PATHWAY</div>
                            <div className="pathway-list">
                                {result.improvements?.map((imp, idx) => (
                                    <div key={idx} className="pathway-item">
                                        <div className="pi-step">{idx + 1}</div>
                                        <div className="pi-body">
                                            <h4>Improvement Step</h4>
                                            <p>{imp}</p>
                                        </div>
                                    </div>
                                )) || (
                                    <p className="text-muted">Algorithm is currently optimal for this constraints set.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: CODE PREVIEW */}
                    <div className="review-section-glass">
                        <div className="rs-header"><Code size={18}/> SUBMITTED CODE</div>
                        <pre className="review-code-block">
                            <code>{submission}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingReview;
