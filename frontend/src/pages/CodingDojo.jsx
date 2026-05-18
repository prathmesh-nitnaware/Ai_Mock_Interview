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
  MessageSquare,
  Search,
  Filter,
  Trophy,
  Medal
} from 'lucide-react';
import './CodingDojo.css';

const SUPPORTED_LANGUAGES = {
  python: 'Python 3',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++'
};

const getBoilerplate = (lang, challenge) => {
  if (!challenge) return '';
  if (lang === 'python') return challenge.starter_code;
  if (lang === 'javascript') return `// JavaScript solution for: ${challenge.title}\n\nfunction solution() {\n    \n}`;
  if (lang === 'java') return `// Java solution for: ${challenge.title}\n\nclass Solution {\n    public void method() {\n        \n    }\n}`;
  if (lang === 'cpp') return `// C++ solution for: ${challenge.title}\n\n#include <iostream>\n\nint main() {\n    \n    return 0;\n}`;
  return '';
};

const CodingDojo = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('selection'); // 'selection' or 'solver'
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await api.client.get("/api/coding/leaderboard");
      setLeaderboardData(res.data);
    } catch (err) {
      console.error("Leaderboard Fetch Error:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (showLeaderboard && leaderboardData.length === 0) {
      fetchLeaderboard();
    }
  }, [showLeaderboard]);

  const filteredChallenges = challenges.filter((c, i) => {
    const challengeNumber = (i + 1).toString();
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = c.title.toLowerCase().includes(searchLower) || challengeNumber === searchLower;
    const matchesDifficulty = filterDifficulty === 'All' || c.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });


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
    setCode(getBoilerplate(language, challenge));
    setView('solver');
    setResult(null);
  };

  const handleExecute = async (action) => {
    setSubmitting(true);
    setActionType(action);
    try {
      const res = await api.client.post("/api/coding/submit", {
        challenge_id: selectedChallenge.id,
        code: code,
        language: language,
        action: action
      });
      setResult(res.data);
      setActiveTab('results');
    } catch (err) {
      alert("Evaluation failed. Is the server running?");
    } finally {
      setSubmitting(false);
      setActionType(null);
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
           <div className="brand-pill-light"><Code size={14}/> CODING_DOJO</div>

           <h1>Choose Your Challenge</h1>
           <p className="subtitle">Master advanced algorithms and machine learning fundamentals from scratch.</p>

           <div className="dojo-view-toggle mt-6">
             <button 
               className={`toggle-btn ${!showLeaderboard ? 'active' : ''}`}
               onClick={() => setShowLeaderboard(false)}
             >
               <Code size={16}/> CHALLENGES
             </button>
             <button 
               className={`toggle-btn ${showLeaderboard ? 'active' : ''}`}
               onClick={() => setShowLeaderboard(true)}
             >
               <Trophy size={16}/> LEADERBOARD
             </button>
           </div>
        </div>

        {showLeaderboard ? (
          <div className="leaderboard-container glass-panel fade-in">
            {leaderboardLoading ? (
              <div className="text-center p-8 text-muted"><Loader2 className="spin" size={24}/></div>
            ) : leaderboardData.length === 0 ? (
              <div className="empty-state text-muted text-center p-8">No leaderboard data available yet. Be the first to solve a challenge!</div>
            ) : (
              <div className="table-responsive">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>WARRIOR</th>
                      <th>CHALLENGES SOLVED</th>
                      <th>TOTAL SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((user, index) => (
                      <tr key={index} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
                        <td className="rank-cell">
                          {index === 0 ? <Medal size={20} className="text-gold"/> : 
                           index === 1 ? <Medal size={20} className="text-silver"/> : 
                           index === 2 ? <Medal size={20} className="text-bronze"/> : 
                           `#${index + 1}`}
                        </td>
                        <td className="name-cell">{user.name}</td>
                        <td>{user.challenges_solved}</td>
                        <td className="score-cell">{user.score} PTS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="dojo-filters-container">
          <div className="search-bar glass-panel">
            <Search size={18} className="text-muted"/>
            <input 
              type="text" 
              placeholder="Search challenges (e.g. Binary Search)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="difficulty-filters glass-panel">
            <Filter size={16} className="text-muted" style={{ marginRight: '8px' }}/>
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button 
                key={diff} 
                className={`diff-btn ${filterDifficulty === diff ? 'active' : ''}`}
                onClick={() => setFilterDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="challenge-grid">
          {filteredChallenges.length === 0 ? (
            <div className="empty-state text-muted" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
               No challenges found matching your criteria.
            </div>
          ) : filteredChallenges.map((challenge) => {
            const index = challenges.findIndex(c => c.id === challenge.id) + 1;
            return (
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
              <h3>{index}. {challenge.title}</h3>
              <p>{challenge.description.substring(0, 80)}...</p>
              <div className="card-footer">
                 <div className="points-tag"><Zap size={12}/> 500 PTS</div>
                 <div className="enter-btn">ENTER <ArrowRight size={14}/></div>
              </div>
            </div>
          )})}
            </div>
          </>
        )}
      </div>
    );
  }

  // --- SOLVER VIEW ---
  const selectedIndex = challenges.findIndex(c => c.id === selectedChallenge?.id) + 1;
  
  return (
    <div className="dojo-root solver-view fade-in">
      <div className="solver-nav">
        <button className="back-btn" onClick={() => setView('selection')}>
           <ChevronLeft size={18}/> BACK TO DOJO
        </button>
        <div className="challenge-mini-info">
           <span className="mini-title">{selectedIndex}. {selectedChallenge.title}</span>
           <span className={`mini-diff ${selectedChallenge.difficulty.toLowerCase()}`}>
             {selectedChallenge.difficulty}
           </span>
        </div>
        <div className="solver-actions-top" style={{ display: 'flex', gap: '12px' }}>
           <button 
              className="run-btn-secondary" 
              onClick={() => handleExecute('run')} 
              disabled={submitting}
           >
              {submitting && actionType === 'run' ? <Loader2 size={16} className="spin"/> : <Terminal size={16}/>}
              {submitting && actionType === 'run' ? "CHECKING..." : "RUN CODE"}
           </button>
           <button 
              className="run-btn-main" 
              onClick={() => handleExecute('submit')} 
              disabled={submitting}
           >
              {submitting && actionType === 'submit' ? <Loader2 size={16} className="spin"/> : <Play size={16}/>}
              {submitting && actionType === 'submit' ? "SUBMITTING..." : "SUBMIT"}
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
                <h2>{selectedIndex}. {selectedChallenge.title}</h2>
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
                <select 
                  className="lang-select" 
                  value={language}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setLanguage(newLang);
                    setCode(getBoilerplate(newLang, selectedChallenge));
                  }}
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
             </div>
             <button className="reset-code" onClick={() => setCode(getBoilerplate(language, selectedChallenge))}>
                <RotateCcw size={14}/> RESET
             </button>
          </div>
          
          <div className="monaco-wrapper">
             <Editor
               height="100%"
               language={language}
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
