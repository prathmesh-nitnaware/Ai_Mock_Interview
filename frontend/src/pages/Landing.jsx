import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Mic, FileText, Sparkles, ChevronRight } from 'lucide-react';
import '../styles/theme.css'; 
import './Landing.css';       

const Landing = () => {
  const [text, setText] = useState('');
  const fullText = "Master Your Career with PrepAI."; 
  
  useEffect(() => {
    let index = 0;
    const speed = 80; 

    const typeWriter = () => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
        setTimeout(typeWriter, speed);
      }
    };

    // Slight delay before typing starts for better effect
    setTimeout(typeWriter, 500); 
  }, []);

  return (
    <div className="landing-root">
      
      {/* Background Effects */}
      <div className="hero-glow"></div>
      <div className="noise-bg"></div>
      
      {/* Floating Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
           <div className="brand-dot"></div>
           PREP AI
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link-login">Sign In</Link>
          <Link to="/signup" className="nav-btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="page-container hero-section">
        <div className="hero-content fade-in-up">
          
          <div className="release-badge">
             <Sparkles size={14} className="badge-icon" />
             <span>PrepAI 2.0 is now live</span>
             <ChevronRight size={14} />
          </div>
          
          <h1 className="hero-title">
            <span className="typing-text">{text}</span>
            <span className="cursor">|</span>
          </h1>
          
          <p className="hero-desc fade-in-up delay-200">
            Real-time voice analysis, ATS resume scoring, and algorithmic challenges. 
            Designed for engineers and professionals who demand perfection.
          </p>
          
          <div className="hero-actions fade-in-up delay-300">
            <Link to="/signup" className="btn-hero-primary">
              Start Your Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="page-container features-section">
        <div className="features-header fade-in-up delay-400">
          <h2 className="features-title">Intelligent Modules</h2>
          <p className="features-sub">Everything you need to land the offer.</p>
        </div>

        <div className="features-grid">
          
          {/* Feature 01 */}
          <div className="feature-card fade-in-up delay-500">
            <div className="fc-icon-wrapper bg-blue-glow">
              <Mic size={24} className="text-blue" />
            </div>
            <h3 className="feature-heading">Real-time Voice Analysis</h3>
            <p className="feature-desc">
              Get instant AI feedback on your tone, pacing, filler words, and confidence levels during live mock sessions.
            </p>
          </div>

          {/* Feature 02 */}
          <div className="feature-card fade-in-up delay-600">
            <div className="fc-icon-wrapper bg-blue-glow">
              <FileText size={24} className="text-blue" />
            </div>
            <h3 className="feature-heading">Smart ATS Scorer</h3>
            <p className="feature-desc">
              Upload your PDF resume. Our extraction engine maps your experience and tailors the interview questions directly to your past projects.
            </p>
          </div>

          {/* Feature 03 */}
          <div className="feature-card fade-in-up delay-700">
            <div className="fc-icon-wrapper bg-indigo-glow">
              <Terminal size={24} className="text-indigo" />
            </div>
            <h3 className="feature-heading">Technical Coding Dojo</h3>
            <p className="feature-desc">
              Practice Data Structures, Algorithms, and System Design problems in a distraction-free, integrated code editor.
            </p>
          </div>

        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section fade-in-up delay-800">
        <p className="trust-label">TRUSTED BY CANDIDATES INTERVIEWING AT</p>
        <div className="trust-logos">
          <span>GOOGLE</span>
          <span>AMAZON</span>
          <span>META</span>
          <span>NETFLIX</span>
          <span>MICROSOFT</span>
        </div>
      </section>

    </div>
  );
};

export default Landing;
