import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { 
  Terminal, 
  Play, 
  CheckCircle, 
  Code, 
  Award, 
  RotateCcw, 
  Loader2, 
  ChevronLeft,
  ArrowRight,
  Database,
  Cpu,
  BrainCircuit,
  Zap,
  Layout,
  MessageSquare
} from 'lucide-react';
import './CodingDojo.css';

const CodingDojo = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('selection'); // 'selection' or 'solver'
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch initial challenge list
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.client.get("/api/coding/challenges");
        setChallenges(res.data);
      } catch (err) {
        console.error("Dojo Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setCode(challenge.starter_code);
    setView('solver');
    setResult(null);
  };

  const handleRunCode = async () => {
    setSubmitting(true);
    try {
      const res = await api.client.post("/api/coding/submit", {
        challenge_id: selectedChallenge.id,
        code: code
      });
      setResult(res.data);
      setActiveTab('results');
    } catch (err) {
      alert("Evaluation failed. Is the server running?");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dojo-loading">
        <div className="neon-spinner"></div>
        <p>LOADING MULTIVERSE DOJO...</p>
      </div>
    );
  }

  // --- SELECTION VIEW ---
  if (view === 'selection') {
    return (
      <div className="dojo-root selection-view fade-in">
        <div className="ambient-glow-dojo"></div>
        <div className="selection-header">
           <div className="brand-pill-light"><BrainCircuit size={14}/> ML_CODING_DOJO</div>
           <h1>Choose Your Challenge</h1>
           <p className="subtitle">Master advanced algorithms and machine learning fundamentals from scratch.</p>
        </div>

        <div className="challenge-grid">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className="challenge-card glass-panel-hover"
              onClick={() => handleSelectChallenge(challenge)}
            >
              <div className="card-top">
                <div className={`difficulty-indicator ${challenge.difficulty.toLowerCase()}`}>
                  {challenge.difficulty}
                </div>
                <div className="tech-icon">
                  {challenge.id.startsWith('ml') ? <Cpu size={18}/> : <Database size={18}/>}
                </div>
              </div>
              <h3>{challenge.title}</h3>
              <p>{challenge.description.substring(0, 80)}...</p>
              <div className="card-footer">
                 <div className="points-tag"><Zap size={12}/> 500 PTS</div>
                 <div className="enter-btn">ENTER <ArrowRight size={14}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- SOLVER VIEW ---
  return (
    <div className="dojo-root solver-view fade-in">
      <div className="solver-nav">
        <button className="back-btn" onClick={() => setView('selection')}>
           <ChevronLeft size={18}/> BACK TO DOJO
        </button>
        <div className="challenge-mini-info">
           <span className="mini-title">{selectedChallenge.title}</span>
           <span className={`mini-diff ${selectedChallenge.difficulty.toLowerCase()}`}>
             {selectedChallenge.difficulty}
           </span>
        </div>
        <div className="solver-actions-top">
           <button className="run-btn-main" onClick={handleRunCode} disabled={submitting}>
              {submitting ? <Loader2 size={16} className="spin"/> : <Play size={16}/>}
              {submitting ? "EVALUATING..." : "RUN CODE"}
           </button>
        </div>
      </div>

      <div className="solver-layout">
        {/* LEFT PANEL: PROBLEM & RESULTS */}
        <div className="problem-panel-improved glass-panel">
          <div className="tab-switcher">
            <button 
              className={activeTab === 'description' ? 'active' : ''} 
              onClick={() => setActiveTab('description')}
            >
              <Layout size={14}/> PROBLEM
            </button>
            <button 
              className={activeTab === 'results' ? 'active' : ''} 
              onClick={() => setActiveTab('results')}
              disabled={!result}
            >
              <CheckCircle size={14}/> RESULTS
            </button>
            <button 
              className={activeTab === 'feedback' ? 'active' : ''} 
              onClick={() => setActiveTab('feedback')}
              disabled={!result}
            >
              <MessageSquare size={14}/> AI FEEDBACK
            </button>
          </div>

          <div className="panel-content">
            {activeTab === 'description' && (
              <div className="description-view fade-in">
                <h2>{selectedChallenge.title}</h2>
                <div className="problem-text">{selectedChallenge.description}</div>
                
                {selectedChallenge.constraints && (
                  <div className="problem-meta-box">
                    <h4>CONSTRAINTS</h4>
                    <ul>
                      {selectedChallenge.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                <div className="example-box">
                  <h4>SAMPLE INPUT</h4>
                  <pre>{selectedChallenge.sample_input}</pre>
                  <h4>SAMPLE OUTPUT</h4>
                  <pre>{selectedChallenge.sample_output}</pre>
                </div>
              </div>
            )}

            {activeTab === 'results' && result && (
              <div className="results-view fade-in">
                <div className={`status-banner ${result.success ? 'success' : 'failure'}`}>
                  {result.success ? <CheckCircle size={28}/> : <RotateCcw size={28}/>}
                  <div>
                    <h3>{result.success ? "Accepted" : "Revision Required"}</h3>
                    <p>{result.success ? "All logic tests passed successfully." : "The code has logic flaws."}</p>
                  </div>
                </div>

                <div className="metrics-grid">
                   <div className="metric-card">
                      <span className="m-label">LOGIC_SCORE</span>
                      <span className="m-val">{result.clarity_score}/10</span>
                   </div>
                   <div className="metric-card">
                      <span className="m-label">EFFICIENCY</span>
                      <span className="m-val">{result.confidence_score}/10</span>
                   </div>
                </div>

                <div className="improvements-list">
                  <h4>SUGGESTED OPTIMIZATIONS</h4>
                  {result.improvements?.map((imp, i) => (
                    <div key={i} className="imp-item">
                       <Zap size={14} className="text-indigo"/>
                       <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && result && (
              <div className="feedback-view fade-in">
                 <div className="ai-head">
                    <Award size={20}/> 
                    <span>AI ARCHITECT REVIEW</span>
                 </div>
                 <p className="detailed-feedback">{result.feedback}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: MONACO EDITOR */}
        <div className="editor-panel-improved glass-panel">
          <div className="editor-controls">
             <div className="ec-left">
                <div className="lang-badge">PYTHON 3.10</div>
             </div>
             <button className="reset-code" onClick={() => setCode(selectedChallenge.starter_code)}>
                <RotateCcw size={14}/> RESET
             </button>
          </div>
          
          <div className="monaco-wrapper">
             <Editor
               height="100%"
               defaultLanguage="python"
               theme="vs-dark"
               value={code}
               onChange={(val) => setCode(val)}
               options={{
                 fontSize: 14,
                 minimap: { enabled: false },
                 scrollBeyondLastLine: false,
                 automaticLayout: true,
                 padding: { top: 20 },
                 fontFamily: "'Fira Code', monospace",
                 smoothScrolling: true,
                 cursorBlinking: "expand"
               }}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingDojo;