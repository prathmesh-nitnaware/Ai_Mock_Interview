import React from 'react';
import { Target, Award, CheckCircle2, Flame } from 'lucide-react';

export const ReadinessSection = ({ metrics }) => {
  const { totalInterviews, averageScore, bestScore, readinessScore, readinessLabel } = metrics;

  // Calculate SVG circular arc
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="dash-overview-card">
      {/* Left: Readiness Gauge */}
      <div className="readiness-gauge-box">
        <div className="gauge-svg-wrap">
          <svg className="gauge-svg" width="136" height="136" viewBox="0 0 136 136">
            {/* Background track */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              className="gauge-bg-circle"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              className="gauge-progress-circle"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 68 68)"
            />
          </svg>
          <div className="gauge-center-content">
            <span className="gauge-score-value">{readinessScore}</span>
            <span className="gauge-score-unit">%</span>
          </div>
        </div>

        <div className="gauge-text-info">
          <span className="gauge-label-caption">Placement Readiness</span>
          <span className="gauge-status-badge">{readinessLabel}</span>
          <p className="gauge-description">
            {totalInterviews > 0
              ? 'Computed from technical depth, consistency, and session performance.'
              : 'Complete your first session to calibrate your readiness.'}
          </p>
        </div>
      </div>

      {/* Right: 4 Supporting Stat Items */}
      <div className="stats-inline-grid">
        <div className="stat-compact-item">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Sessions</span>
            <CheckCircle2 size={16} className="stat-icon-muted" />
          </div>
          <div className="stat-compact-value">{totalInterviews}</div>
          <span className="stat-compact-sub">Completed</span>
        </div>

        <div className="stat-compact-item">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Avg Score</span>
            <Target size={16} className="stat-icon-muted" />
          </div>
          <div className="stat-compact-value">
            {totalInterviews > 0 ? `${averageScore}%` : '—'}
          </div>
          <span className="stat-compact-sub">Technical content</span>
        </div>

        <div className="stat-compact-item">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Best Score</span>
            <Award size={16} className="stat-icon-muted" />
          </div>
          <div className="stat-compact-value">
            {totalInterviews > 0 ? `${bestScore}%` : '—'}
          </div>
          <span className="stat-compact-sub">Peak performance</span>
        </div>

        <div className="stat-compact-item">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Streak</span>
            <Flame size={16} className="stat-icon-muted" />
          </div>
          <div className="stat-compact-value">
            {metrics.streakDays > 0 ? `${metrics.streakDays}d` : '0d'}
          </div>
          <span className="stat-compact-sub">Practice consistency</span>
        </div>
      </div>
    </div>
  );
};

export default ReadinessSection;
