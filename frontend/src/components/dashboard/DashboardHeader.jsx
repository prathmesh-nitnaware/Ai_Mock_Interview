import React from 'react';
import { Link } from 'react-router-dom';
import { Play, FileText, Sparkles, ArrowRight } from 'lucide-react';

export const DashboardHeader = ({ user, metrics, resumeName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Candidate';
  const roleName = user?.target_role || user?.role || 'Software Engineer';

  return (
    <div className="dash-header-block">
      <div className="dash-header-main">
        <div className="dash-header-meta">
          <span className="dash-role-badge">
            <Sparkles size={13} className="dash-role-icon" />
            {roleName} Track
          </span>
          {metrics.streakDays > 0 && (
            <span className="dash-streak-pill">
              🔥 {metrics.streakDays}-Day Streak
            </span>
          )}
        </div>

        <h1 className="dash-title">
          {getGreeting()}, {firstName}
        </h1>

        <p className="dash-subtitle">
          {metrics.totalInterviews > 0
            ? `Your interview preparation at a glance. ${
                metrics.lastInterviewDate
                  ? `Last session completed ${metrics.lastInterviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
                  : ''
              }`
            : 'Welcome to your placement preparation command center. Start your first mock interview to establish your baseline.'}
        </p>
      </div>

      <div className="dash-header-actions">
        <Link to="/interview/setup" className="btn-dash-primary">
          <Play size={16} fill="currentColor" />
          <span>Start Mock Interview</span>
        </Link>

        <Link to="/resume/upload" className="btn-dash-secondary">
          <FileText size={16} />
          <span>{resumeName ? 'Update Resume' : 'Upload Resume'}</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
