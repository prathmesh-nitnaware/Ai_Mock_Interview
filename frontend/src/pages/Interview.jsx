import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; // This imports the object with methods like initiateInterview

import {
  ChevronRight,
  Code2,
  Users,
  Settings,
  AlertCircle,
  FileText,
  CheckCircle2,
  UploadCloud,
  Loader2,
} from "lucide-react";

import Button from "../components/ui/Button";
import InputField from "../components/forms/InputField";

import "../styles/theme.css";
import "./Interview.css";

const Interview = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [fetchingResume, setFetchingResume] = useState(true);

  useEffect(() => {
    const fetchGlobalResume = async () => {
      try {
        const res = await api.client.get("/api/profile/resume/get");
        if(res.data && res.data.resume_text) {
          setResumeText(res.data.resume_text);
          setResumeName(res.data.resume_filename);
        }
      } catch (err) {
        // No resume found, that's fine
      } finally {
        setFetchingResume(false);
      }
    };
    fetchGlobalResume();
  }, []);

  const [formData, setFormData] = useState({
    role: "",
    experience: "0-2 years",
    type: "Technical",
    difficulty: "Medium",
    questionCount: 5,
  });

  // =========================
  // HANDLERS
  // =========================

  const handleChange = (e) => {
    setError(false);

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =========================
  // =========================
  // SUBMIT
  // =========================

  // =========================
  // SUBMIT (The Fix is here)
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role.trim()) {
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const config = {
        role: formData.role,
        experience: formData.experience,
        focus: formData.type,
        difficulty: formData.difficulty,
        intensity: formData.questionCount,
        resume_context: resumeText,
      };

      /** * FIX: Use api.initiateInterview(config) 
       * instead of api.post(...)
       */
      const data = await api.initiateInterview(config);

      if (!data.session_id || !data.question) {
        alert("Backend response invalid. Please check Ollama logs.");
        return;
      }

      navigate("/interview/session", {
        state: {
          session_id: data.session_id,
          question: data.question,
          config,
        },
      });
    } catch (err) {
      console.error("Interview Init Error:", err);
      alert(err.message || "Failed to initialize interview environment.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OPTIONS
  // =========================

  const expOptions = [
    { label: "0-2 YEARS", val: "0-2 years" },
    { label: "3-5 YEARS", val: "3-5 years" },
    { label: "5+ YEARS", val: "5+ years" },
  ];

  const typeOptions = [
    { label: "Technical", icon: <Code2 size={16} /> },
    { label: "Behavioral", icon: <Users size={16} /> },
    { label: "System Design", icon: <Settings size={16} /> },
  ];

  // =========================
  // UI
  // =========================

  return (
    <div className="interview-root page-container fade-in-up">
      <div className="ambient-glow"></div>

      <div className="interview-split">
        {/* LEFT PANEL */}
        <div className="interview-meta">
          <div className="meta-badge">SYSTEM.INIT</div>

          <h1 className="meta-title">
            INTERVIEW
            <br />
            CONFIG
          </h1>

          <p className="meta-desc">
            Configure AI interviewer personality, intensity, and experience
            targeting.
          </p>

          <div className={`context-widget ${resumeText ? "active" : ""}`}>
            <div className="cw-header">
              {fetchingResume ? (
                <Loader2 size={18} className="spin" />
              ) : resumeText ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <FileText size={18} />
              )}

              <h3>
                {fetchingResume
                  ? "Syncing Vault..."
                  : resumeText
                  ? "Vault Linked"
                  : "No Vault Resume"}
              </h3>
            </div>

            {resumeText ? (
              <div className="resume-status-wrapper">
                <p className="resume-status-subtext" style={{margin:'10px 0', color: '#e4e4e7'}}>
                  <strong>Synced:</strong> {resumeName}
                </p>
                <p className="resume-status-subtext" style={{fontSize: '0.8rem', marginBottom: '15px'}}>
                  AI will dynamically tailor the questions towards your background.
                </p>
                <button 
                  className="chip-btn" 
                  style={{justifyContent: 'center', width: '100%', fontSize: '0.85rem'}} 
                  onClick={() => navigate('/profile')}
                >
                  Manage in Profile
                </button>
              </div>
            ) : !fetchingResume && (
              <div className="resume-status-wrapper text-center">
                <p className="resume-status-subtext" style={{marginBottom: '15px'}}>
                  Upload your resume in the Global Vault to sync across services!
                </p>
                <button 
                  className="chip-btn" 
                  style={{justifyContent: 'center', width: '100%', fontSize: '0.85rem'}} 
                  onClick={() => navigate('/profile')}
                >
                  Configure Vault
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="interview-form-wrapper">
          <div className="glass-panel setup-card">
            <form onSubmit={handleSubmit}>
              <InputField
                label="TARGET ROLE"
                name="role"
                placeholder="e.g. Full Stack Developer"
                value={formData.role}
                onChange={handleChange}
              />

              {error && (
                <span className="error-text">
                  <AlertCircle size={14} />
                  Target role required
                </span>
              )}

              <div className="section-label">EXPERIENCE LEVEL</div>

              <div className="chips-row">
                {expOptions.map((exp) => (
                  <button
                    key={exp.val}
                    type="button"
                    onClick={() => handleSelect("experience", exp.val)}
                    className={`chip-btn ${formData.experience === exp.val ? "active" : ""}`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>

              <div className="section-label">INTERVIEW TYPE</div>

              <div className="chips-row">
                {typeOptions.map((type) => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => handleSelect("type", type.label)}
                    className={`chip-btn ${formData.type === type.label ? "active" : ""}`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="section-label">DIFFICULTY LEVEL</div>

              <div className="chips-row">
                {["Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => handleSelect("difficulty", diff)}
                    className={`chip-btn ${formData.difficulty === diff ? "active" : ""}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="section-label">SESSION LENGTH (QUESTIONS)</div>

              <div className="chips-row">
                {[3, 5, 7, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSelect("questionCount", num)}
                    className={`chip-btn ${formData.questionCount === num ? "active" : ""}`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>

              <div className="submit-row">
                <Button type="submit" isLoading={loading} disabled={loading}>
                  {loading ? "GENERATING QUESTIONS..." : "INITIALIZE ENVIRONMENT"}
                  {!loading && <ChevronRight size={18} />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
