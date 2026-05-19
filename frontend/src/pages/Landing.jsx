import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Mic, FileText, Sparkles, ChevronRight, Zap, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { API_URL } = useAuth();
  const [text, setText] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [serverStatus, setServerStatus] = useState('waking');
  const fullText = "Ace Every Interview.";

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Backend wake-up ping
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

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const typeWriter = () => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
        setTimeout(typeWriter, 75);
      }
    };
    const timer = setTimeout(typeWriter, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-root">
      <div className="noise-bg"></div>

      {/* ── NAVBAR ────────────────────────────────── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand">
          <div className="brand-dot"></div>
          PREP AI
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link-login">Sign In</Link>
          <Link to="/signup" className="nav-btn-primary">Get Started →</Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────── */}
      <section className="page-container hero-section">
        <div className="hero-content">
          <div className="release-badge fade-in-up">
            <Sparkles size={13} className="badge-icon" />
            <span>PrepAI 2.0 — Now with AI Voice Analysis</span>
            <ChevronRight size={13} />
          </div>

          <h1 className="hero-title fade-in-up delay-100">
            <span>{text}</span>
            <span className="cursor">|</span>
          </h1>

          <p className="hero-desc fade-in-up delay-200">
            AI-powered mock interviews, ATS resume scoring, and algorithmic challenges
            — all in one platform built for engineers who refuse to settle.
          </p>

          <div className="hero-actions fade-in-up delay-300">
            <Link to="/signup" className="btn-hero-primary">
              Start Free <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats fade-in-up delay-400">
            <div className="hero-stat">
              <span className="hero-stat-value">5K+</span>
              <span className="hero-stat-label">Practice Sessions</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">92%</span>
              <span className="hero-stat-label">Pass Rate</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">3 min</span>
              <span className="hero-stat-label">To First Interview</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="features-section">
        <div className="features-header fade-in-up delay-400">
          <span className="features-eyebrow">What you get</span>
          <h2 className="features-title">Everything you need to land the offer</h2>
          <p className="features-sub">Three intelligent modules, one seamless workflow.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card fade-in-up delay-500">
            <div className="fc-icon-wrapper bg-blue-glow">
              <Mic size={22} className="text-blue" />
            </div>
            <h3 className="feature-heading">AI Mock Interviews</h3>
            <p className="feature-desc">
              Real-time voice analysis with instant feedback on tone, pacing, filler words, 
              and confidence. Five-stage simulation covering behavioral and technical rounds.
            </p>
          </div>

          <div className="feature-card fade-in-up delay-600">
            <div className="fc-icon-wrapper bg-blue-glow">
              <FileText size={22} className="text-blue" />
            </div>
            <h3 className="feature-heading">Smart ATS Scorer</h3>
            <p className="feature-desc">
              Upload your PDF resume and get a detailed ATS compatibility score with 
              actionable improvements. Tailors interview questions to your actual experience.
            </p>
          </div>

          <div className="feature-card fade-in-up delay-700">
            <div className="fc-icon-wrapper bg-indigo-glow">
              <Terminal size={22} className="text-indigo" />
            </div>
            <h3 className="feature-heading">Coding Dojo</h3>
            <p className="feature-desc">
              Practice DSA, system design, and algorithms in a distraction-free editor 
              with curated problem sets mapped to real FAANG interview patterns.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="steps-section">
        <span className="features-eyebrow">How it works</span>
        <h2 className="features-title">Up and running in minutes</h2>
        <div className="steps-grid">
          <div className="step-card fade-in-up delay-400">
            <div className="step-number">01</div>
            <div className="step-title">Create your account</div>
            <p className="step-desc">Sign up in under 30 seconds. No credit card required. Your free tier includes full access to core features.</p>
          </div>
          <div className="step-card fade-in-up delay-500">
            <div className="step-number">02</div>
            <div className="step-title">Upload your resume</div>
            <p className="step-desc">Sync your PDF resume once to the Resume Vault. The AI uses it to personalize all mock interview questions.</p>
          </div>
          <div className="step-card fade-in-up delay-600">
            <div className="step-number">03</div>
            <div className="step-title">Start your first interview</div>
            <p className="step-desc">Choose your target role, configure difficulty, and start a live AI mock session with real-time voice feedback.</p>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ─────────────────────────── */}
      <section className="trust-section fade-in-up delay-800">
        <p className="trust-label">Trusted by candidates interviewing at</p>
        <div className="trust-logos">
          <span>GOOGLE</span>
          <span>AMAZON</span>
          <span>META</span>
          <span>NETFLIX</span>
          <span>MICROSOFT</span>
        </div>
      </section>

      {/* ── SERVER STATUS ──────────────────────────── */}
      <div className="server-status-bar">
        <div className={`server-status-pill ${serverStatus}`}>
          <span className="status-pulse-dot"></span>
          <span>
            {serverStatus === 'waking'  && 'CONNECTING...'}
            {serverStatus === 'online'  && 'SYSTEM ONLINE'}
            {serverStatus === 'offline' && 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
