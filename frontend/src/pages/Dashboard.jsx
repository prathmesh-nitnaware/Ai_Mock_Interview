import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { computeDashboardMetrics } from '../utils/dashboardMetrics';

// Subcomponents
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ReadinessSection from '../components/dashboard/ReadinessSection';
import ActivityStreak from '../components/dashboard/ActivityStreak';
import FocusAreas from '../components/dashboard/FocusAreas';
import ContinueSession from '../components/dashboard/ContinueSession';
import RecentInterviewsTable from '../components/dashboard/RecentInterviewsTable';
import ResumeStatusCard from '../components/dashboard/ResumeStatusCard';
import QuickActionsGrid from '../components/dashboard/QuickActionsGrid';

import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeName, setResumeName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      // 1. Fetch Session History
      const historyRes = await api.client.get('/api/interview/history');
      const sessions = historyRes.data || [];
      setHistory(sessions);

      // 2. Fetch Active Resume from Vault (Silent catch on 404)
      try {
        const resumeRes = await api.client.get('/api/profile/resume/get');
        if (resumeRes.data && resumeRes.data.resume_filename) {
          setResumeName(resumeRes.data.resume_filename);
        } else {
          setResumeName(null);
        }
      } catch (err) {
        setResumeName(null);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback(null);
    const uploadData = new FormData();
    uploadData.append('resume', file);

    try {
      await api.client.post('/api/profile/resume/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeName(file.name);
      setUploadFeedback({ type: 'success', message: 'Resume uploaded and synced to vault.' });
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err) {
      setUploadFeedback({ type: 'error', message: 'Failed to upload resume. Please try again.' });
      setTimeout(() => setUploadFeedback(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this interview record from your history?')) return;
    try {
      await api.client.delete(`/api/interview/delete/${sessionId}`);
      // Optimistic update
      setHistory((prev) => prev.filter((s) => (s.id || s._id) !== sessionId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete session record.');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Compute all metrics deterministically
  const metrics = computeDashboardMetrics(history);

  if (loading) {
    return (
      <div className="dash-container">
        <div className="dash-skeleton-grid">
          <div className="sk-item sk-header" style={{ height: 110 }} />
          <div className="sk-item sk-overview" style={{ height: 160 }} />
          <div className="dash-two-column-layout">
            <div className="dash-col-main">
              <div className="sk-item" style={{ height: 140, marginBottom: '1.25rem' }} />
              <div className="sk-item" style={{ height: 280 }} />
            </div>
            <div className="dash-col-side">
              <div className="sk-item" style={{ height: 150, marginBottom: '1.25rem' }} />
              <div className="sk-item" style={{ height: 180, marginBottom: '1.25rem' }} />
              <div className="sk-item" style={{ height: 140 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page-wrapper">
      <div className="dash-container">
        {/* Upload feedback banner if active */}
        {uploadFeedback && (
          <div className={`dash-toast ${uploadFeedback.type}`}>
            <span>{uploadFeedback.message}</span>
          </div>
        )}

        {/* 1. Header with Greeting & Primary Actions */}
        <DashboardHeader
          user={user}
          metrics={metrics}
          resumeName={resumeName}
        />

        {/* 2. Readiness Circular Gauge & Stats Grid */}
        <ReadinessSection metrics={metrics} />

        {/* 3. Main Dashboard Layout (2 Columns on Desktop) */}
        <div className="dash-two-column-layout">
          {/* Left / Primary Column */}
          <div className="dash-col-main">
            {/* Continue or Start Session */}
            <ContinueSession
              latestSession={metrics.latestSession}
              totalInterviews={metrics.totalInterviews}
            />

            {/* Recent Interviews Table */}
            <RecentInterviewsTable
              history={history}
              onDelete={handleDeleteSession}
            />
          </div>

          {/* Right / Secondary Column */}
          <div className="dash-col-side">
            {/* 7-Day Activity Strip & Streak */}
            <ActivityStreak metrics={metrics} />

            {/* Focus Areas / Competencies */}
            <FocusAreas metrics={metrics} />

            {/* Placement Resume Status Card */}
            <ResumeStatusCard
              resumeName={resumeName}
              isUploading={isUploading}
              onUpload={handleResumeUpload}
            />
          </div>
        </div>

        {/* 4. Quick Actions / Modules */}
        <QuickActionsGrid />
      </div>
    </div>
  );
};

export default Dashboard;
