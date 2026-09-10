import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Mic, FileText, Sparkles, UploadCloud, Cpu, LineChart, Users, Star, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import './Landing.css';

const Landing = () => {
  const { API_URL } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [serverStatus, setServerStatus] = useState('waking');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const wakeBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        setServerStatus(res.ok ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };
    wakeBackend();
  }, [API_URL]);

  return (
    <div className="landing-root">

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand">
          <div className="brand-dot">
            <Sparkles size={14} color="white" />
          </div>
          PREP AI
        </div>
        <div className="nav-links">
          <ThemeToggle />
          <Link to="/login" className="nav-link-login">Sign In</Link>
          <Link to="/signup" className="btn-hero-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-content fade-in-up">
          <div className="release-badge">
            <Sparkles size={13} className="badge-icon" />
            <span>PrepAI 2.0 — AI-Powered Interview Mastery</span>
          </div>

          <h1 className="hero-title">
            Master your career<br />
            with <span className="hero-title-gradient">Prep AI.</span>
          </h1>

          <p className="hero-desc">
            Stop guessing what interviewers want. Practice with an intelligent AI that scores your technical knowledge, behavioral cues, and coding architecture in real-time.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="btn-hero-primary">
              Try Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Sign In
            </Link>
          </div>

          <div className="hero-social-proof">
            <div className="proof-pill">
              <Users size={13} />
              <span>10,000+ Engineers</span>
            </div>
            <div className="proof-dot"></div>
            <div className="proof-pill">
              <Star size={13} style={{ color: '#f59e0b' }} />
              <span>4.9 / 5 Rating</span>
            </div>
            <div className="proof-dot"></div>
            <div className="proof-pill">
              <Zap size={13} style={{ color: '#06b6d4' }} />
              <span>Real-time Feedback</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="features-section">
        <div className="features-header fade-in-up delay-200">
          <h2>Everything you need to land the offer.</h2>
          <p>Three intelligent modules, one seamless workflow.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card fade-in-up delay-300">
            <div className="fc-icon-wrapper">
              <Mic size={24} className="fc-icon" />
            </div>
            <h3>AI Mock Interviews</h3>
            <p>Real-time voice analysis with instant feedback on tone, pacing, filler words, and confidence. Powered by advanced NLP.</p>
          </div>

          <div className="feature-card fade-in-up delay-400">
            <div className="fc-icon-wrapper">
              <FileText size={24} className="fc-icon" />
            </div>
            <h3>Smart ATS Scorer</h3>
            <p>Upload your resume to get compatibility scores, keyword gaps, and tailored interview questions based on your actual experience.</p>
          </div>

          <div className="feature-card fade-in-up delay-500">
            <div className="fc-icon-wrapper">
              <Terminal size={24} className="fc-icon" />
            </div>
            <h3>Coding Dojo</h3>
            <p>Practice algorithms in a distraction-free editor with AI reviewing your time/space complexity and providing optimization tips.</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="how-it-works-section">
        <div className="hiw-header fade-in-up">
          <h2>Up and running in minutes.</h2>
        </div>
        <div className="hiw-grid">
          <div className="hiw-step fade-in-up delay-200">
            <div className="hiw-icon"><UploadCloud size={24} /></div>
            <h4>1. Upload Resume</h4>
            <p>Sync your PDF once. The AI customizes all mock sessions based on your actual experience and target role.</p>
          </div>
          <div className="hiw-step fade-in-up delay-300">
            <div className="hiw-icon"><Cpu size={24} /></div>
            <h4>2. Practice with AI</h4>
            <p>Engage in realistic voice-based mock interviews or tackle algorithmic coding challenges curated for your level.</p>
          </div>
          <div className="hiw-step fade-in-up delay-400">
            <div className="hiw-icon"><LineChart size={24} /></div>
            <h4>3. Track Progress</h4>
            <p>Review comprehensive scorecards, actionable feedback, and performance trends over time to measure growth.</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="cta-section fade-in-up">
        <div className="cta-inner">
          <h2>Ready to ace your next interview?</h2>
          <p>Join thousands of engineers practicing with Prep AI.</p>
          <Link to="/signup" className="btn-hero-primary">
            Get Started Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="nav-brand" style={{ fontSize: '0.8rem', gap: '0.5rem' }}>
            <div className="brand-dot" style={{ width: 20, height: 20, borderRadius: 5 }}>
              <Sparkles size={10} color="white" />
            </div>
            PREP AI
          </div>
          <p>© {new Date().getFullYear()} Prep AI. All rights reserved.</p>
          <a href="https://github.com/prathmesh-nitnaware/Prep_AI" target="_blank" rel="noreferrer" className="footer-link">
            GitHub ↗
          </a>
        </div>
      </footer>

      {/* ── SERVER STATUS ────────────────────────────────── */}
      <div className="server-status-bar">
        <div className={`server-status-pill ${serverStatus}`}>
          <span className="status-pulse-dot"></span>
          <span>
            {serverStatus === 'waking'  && 'Waking Backend...'}
            {serverStatus === 'online'  && 'System Online'}
            {serverStatus === 'offline' && 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
