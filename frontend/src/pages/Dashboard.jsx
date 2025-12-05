import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, resumeAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import FileUpload from '../components/FileUpload.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ count: 0, latestScore: 0, averageScore: 0, history: [] });
  const [resume, setResume] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('mockai_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      loadStats(userData.id); // Fetch real Mongo Stats
    }
    loadResume();
  }, []);

  const loadStats = async (userId) => {
    try {
      const data = await authAPI.getUserStats(userId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const loadResume = async () => {
    const res = await resumeAPI.getResume();
    if (res.resume) setResume(res.resume);
  };

  const handleConsultation = async () => {
    if(window.confirm("Book a 1-on-1 session for 'Resume Review'?")) {
        await authAPI.bookConsultation(user.id, "Resume Review");
        alert("Consultation booked! Check your email.");
        setShowConsult(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      
      {/* 1. HERO SECTION WITH ANALYTICS */}
      <header className="dashboard-hero">
        <div className="hero-content">
          <h1>Hello, <span className="highlight">{user?.name || 'Candidate'}</span>! 🚀</h1>
          <p className="hero-subtitle">Here is your interview performance overview.</p>
          
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-val">{stats.count}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{stats.averageScore}%</span>
              <span className="stat-label">Avg Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{stats.latestScore}%</span>
              <span className="stat-label">Latest</span>
            </div>
          </div>

          {/* CSS-Only Progress Bar */}
          <div className="progress-container">
            <p>Current Level: <strong>{stats.averageScore > 80 ? 'Pro' : 'Intermediate'}</strong></p>
            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: `${stats.averageScore}%`}}></div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        <h2 className="section-title">Your Preparation Hub</h2>
        
        <div className="options-grid">
          {/* CARD 1: INTERVIEW */}
          <div className="option-card primary-card" onClick={() => navigate('/interview')}>
            <div className="card-icon">🎤</div>
            <div className="card-content">
              <h3>Start AI Mock Interview</h3>
              <p>Real-time audio & video analysis tailored to your resume.</p>
              <span className="card-action">Start Now &rarr;</span>
            </div>
          </div>

          {/* CARD 2: RESUME */}
          <div className="option-card" onClick={() => setShowUpload(!showUpload)}>
            <div className="card-icon">📄</div>
            <div className="card-content">
              <h3>Resume Analyzer</h3>
              <p>{resume ? `File: ${resume.fileName}` : "Upload PDF to generate questions."}</p>
              <span className="card-action">{resume ? 'Update' : 'Upload'} &rarr;</span>
            </div>
          </div>

          {/* CARD 3: CONSULTING (NEW) */}
          <div className="option-card premium-card" onClick={() => setShowConsult(true)}>
            <div className="card-icon">👨‍🏫</div>
            <div className="card-content">
              <h3>Expert Consultation</h3>
              <p>Book a 1-on-1 session with a human expert to review your scores.</p>
              <span className="card-action">Book Session &rarr;</span>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
            <div className="upload-drawer slide-down">
                <h3>Upload Resume</h3>
                <FileUpload onFileUpload={(f) => { resumeAPI.uploadResume(f); setShowUpload(false); }} accept=".pdf" />
            </div>
        )}

         {/* Consultation Modal */}
         {showConsult && (
            <div className="upload-drawer slide-down">
                <h3>Select Topic</h3>
                <div className="consult-buttons">
                    <button className="btn-secondary" onClick={handleConsultation}>Resume Review</button>
                    <button className="btn-secondary" onClick={() => alert("Coming soon!")}>Mock Debrief</button>
                </div>
            </div>
        )}

        {/* TESTIMONIALS */}
        <section className="testimonials-section">
          <h2 className="section-title">Success Stories</h2>
          <div className="testimonials-grid">
             {/* ... (Use previous testimonial code here) ... */}
             <div className="testimonial-card">
               <p className="quote-text">"The analytics helped me see my improvement week over week."</p>
               <p className="author-name">- User A.</p>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;