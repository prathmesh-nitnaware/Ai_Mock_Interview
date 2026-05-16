import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  ChevronLeft,
  MessageCircle,
  Activity,
  Award,
  MicOff,
  FileText,
} from "lucide-react";
import "./InterviewReport.css";

const InterviewReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { history, config } = location.state || { history: [], config: {} };

  if (!history || history.length === 0) {
    return (
      <div className="report-root empty-state">
        <div className="glass-card text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2>No Session Data</h2>
          <button
            onClick={() => navigate("/interview")}
            className="btn-hero-primary"
          >
            START INTERVIEW
          </button>
        </div>
      </div>
    );
  }

  // Analytics Calculation
  const totalQuestions = history.length;
  const avgClarity =
    Math.round(
      history.reduce(
        (acc, curr) => acc + (curr.feedback?.clarity_score || 0),
        0,
      ) / totalQuestions,
    ) || 0;
  const avgConfidence =
    Math.round(
      history.reduce(
        (acc, curr) => acc + (curr.feedback?.confidence_score || 0),
        0,
      ) / totalQuestions,
    ) || 0;
  const totalFillers = history.reduce(
    (acc, curr) => acc + (curr.metrics?.filler_words || 0),
    0,
  );
  const avgWpm =
    Math.round(
      history.reduce((acc, curr) => acc + (curr.metrics?.wpm || 0), 0) /
        totalQuestions,
    ) || 0;
  const overallScore = Math.round(((avgClarity + avgConfidence) / 2) * 10);

  const getTier = (score) => {
    if (score >= 85)
      return {
        color: "success",
        text: "Elite Candidate",
        icon: <Award size={20} />,
      };
    if (score >= 70)
      return {
        color: "warning",
        text: "Job Ready",
        icon: <TrendingUp size={20} />,
      };
    return {
      color: "danger",
      text: "Needs Training",
      icon: <AlertTriangle size={20} />,
    };
  };

  const tier = getTier(overallScore);

  return (
    <div className="report-root fade-in">
      <div className="hero-glow"></div>

      <nav className="report-nav-header">
        <button
          onClick={() => navigate("/dashboard")}
          className="nav-back-glass"
        >
          <ChevronLeft size={18} />
          <span>DASHBOARD</span>
        </button>
        <button className="nav-download-glow" onClick={() => window.print()}>
          <Download size={18} />
          <span>DOWNLOAD PDF</span>
        </button>
      </nav>

      <div className="report-container">
        {/* HORIZONTAL HERO SECTION */}
        <div className="report-hero glass-card">
          <div className="hero-info">
            <h1 className="report-title">
              PERFORMANCE
              <br />
              AUDIT
            </h1>
            <p className="release-badge">
              {config.role?.toUpperCase() || "ML ENGINEER"} • {totalQuestions}{" "}
              SESSIONS
            </p>
          </div>

          <div className={`score-circle-wrapper border-${tier.color}`}>
            <div className="score-value">{overallScore}%</div>
            <div className={`tier-tag bg-${tier.color}`}>
              {tier.icon} {tier.text}
            </div>
          </div>
        </div>

        {/* HORIZONTAL METRICS GRID */}
        <div className="metrics-horizontal-grid">
          <MetricCard
            icon={<MessageCircle className="text-blue" />}
            label="CLARITY"
            value={avgClarity}
            max={10}
          />
          <MetricCard
            icon={<CheckCircle className="text-blue" />}
            label="CONFIDENCE"
            value={avgConfidence}
            max={10}
          />
          <MetricCard
            icon={<Activity className="text-indigo" />}
            label="SPEECH PACE"
            value={avgWpm}
            unit="WPM"
          />
          <MetricCard
            icon={<MicOff className="text-red-500" />}
            label="FILLERS"
            value={totalFillers}
            unit="Detected"
          />
        </div>

        {/* FEEDBACK SECTION */}
        <div className="breakdown-section no-print" style={{ marginTop: '40px' }}>
          <h2 className="section-heading">COMPLETE REPORT</h2>
          <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <FileText size={48} className="text-indigo" style={{ margin: '0 auto 20px auto', display: 'block', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Detailed Session Feedback</h3>
            <p style={{ color: '#a1a1aa', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
              Your individual responses, AI feedback, and suggested improvements have been compiled into a secure, downloadable PDF report.
            </p>
            <button className="btn-hero-primary" onClick={() => window.print()} style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <Download size={20} />
              DOWNLOAD FULL REPORT PDF
            </button>
          </div>
        </div>

        {/* PRINT ONLY SECTION */}
        <div className="print-only-report">
          <h1 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            Interview Session Report
          </h1>
          <p style={{ marginBottom: '30px', fontSize: '14px', color: '#555' }}>Role: {config.role || 'General'}</p>
          
          {history.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#111', marginBottom: '10px' }}>
                Q{idx + 1}: {item.question}
              </h2>
              
              <div style={{ padding: '10px 15px', backgroundColor: '#f9fafb', borderLeft: '4px solid #d1d5db', marginBottom: '15px' }}>
                <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>YOUR ANSWER:</strong>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                  {item.answer || "No verbal response detected."}
                </p>
              </div>

              <div style={{ padding: '10px 15px', backgroundColor: '#eff6ff', borderLeft: '4px solid #6366f1' }}>
                <strong style={{ display: 'block', fontSize: '12px', color: '#4f46e5', marginBottom: '5px' }}>AI FEEDBACK:</strong>
                <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0 }}>
                  {item.feedback?.feedback || "Technical response was structured well."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, max, unit }) => (
  <div className="metric-card-horizontal glass-card">
    <div className="mh-header">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mh-body">
      <span className="mh-value">{value}</span>
      <span className="mh-unit">{max ? `/${max}` : unit}</span>
    </div>
  </div>
);

export default InterviewReport;
