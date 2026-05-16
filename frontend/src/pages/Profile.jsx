import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Edit2,
  Save,
  X,
  Camera,
  Award,
  Shield,
  Zap,
  Activity,
  User,
  Mail,
  Briefcase,
  FileText,
  Upload,
  CheckCircle,
  Loader2,
  Github,
  Linkedin,
  Globe,
  Trash2,
  RefreshCw
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeName, setResumeName] = useState(user?.resume_filename || null);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0 });

  const [formData, setFormData] = useState({
    name: user?.name || "Prathmesh Nitnaware",
    email: user?.email || "",
    role: user?.role || "Software Engineer",
    bio: user?.bio || "Passionate about full-stack development and algorithms.",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    website: user?.website || "",
  });

  // UNIFIED FETCHING LOGIC: Syncs with MongoDB History and Resume Vault
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        // Fetch Interview Stats
        const statsRes = await api.client.get("/api/interview/history");
        const historyData = statsRes.data || [];

        if (historyData.length > 0) {
          const total = historyData.length;
          const avg = Math.round(
            historyData.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / total,
          );
          setStats({ interviews: total, avgScore: avg });
        }

        // Fetch Vault Resume
        const resumeRes = await api.client.get("/api/profile/resume/get");
        if (resumeRes.data && resumeRes.data.resume_filename) {
          setResumeName(resumeRes.data.resume_filename);
        }
      } catch (err) {
        // Safe to ignore if no resume or history
        console.error("Profile Sync Warning:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  // RESUME UPLOAD LOGIC: Stores in MongoDB for reuse in Mock Interview/ATS
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("resume", file);

    try {
      // Endpoint to save resume context to user document in DB
      await api.client.post("/api/profile/resume/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeName(file.name);
    } catch (err) {
      alert("Resume upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    try {
      if(!window.confirm("Are you sure you want to delete your synced resume?")) return;
      await api.client.delete("/api/profile/resume/delete");
      setResumeName(null);
    } catch (err) {
      alert("Failed to delete resume.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.client.put("/api/profile/update", formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader-ring"></div>
      </div>
    );

  return (
    <div className="profile-root fade-in">
      <div className="ambient-glow-profile"></div>

      <div className="profile-content-wrapper">
        {/* --- HEADER PANEL --- */}
        <div className="glass-panel profile-header-panel">
          <div className="profile-header-left">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <User size={40} strokeWidth={1.5} />
              </div>
              <button className="edit-avatar-btn">
                <Camera size={14} />
              </button>
            </div>

            <div className="profile-titles">
              <h1 className="profile-name">{formData.name}</h1>
              <div className="profile-badges">
                <span className="brand-pill">{formData.role}</span>
                <span className="pro-tag">
                  <Shield size={12} /> PRO MEMBER
                </span>
              </div>
            </div>
          </div>

          <div className="profile-header-right">
            <div className="stat-glass-pill">
              <Activity size={18} className="text-indigo" />
              <div className="stat-data">
                <span className="stat-val">{stats.interviews}</span>
                <span className="stat-lbl">SESSIONS</span>
              </div>
            </div>
            <div className="stat-glass-pill">
              <Zap size={18} className="text-blue" />
              <div className="stat-data">
                <span className="stat-val">{stats.avgScore}%</span>
                <span className="stat-lbl">AVG SCORE</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="profile-grid">
          {/* LEFT: Personal Details */}
          <div className="glass-panel">
            <div className="panel-header">
              <h3>PERSONAL DETAILS</h3>
              {!isEditing ? (
                <button
                  className="glass-action-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} /> EDIT PROFILE
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    CANCEL
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      "SAVING..."
                    ) : (
                      <>
                        <Save size={16} /> SAVE CHANGES
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <form className="details-form">
              <div className="form-group-glass">
                <label>
                  <User size={12} /> FULL NAME
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <Mail size={12} /> EMAIL ADDRESS
                </label>
                <input
                  className="input-glass locked"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <Briefcase size={12} /> TARGET ROLE
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <FileText size={12} /> PROFESSIONAL BIO
                </label>
                <textarea
                  className={`input-glass textarea ${!isEditing ? "locked" : ""}`}
                  rows="4"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              {/* SOCIAL LINKS */}
              <div className="form-group-glass">
                <label>
                  <Github size={12} /> GITHUB URL
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.github}
                  onChange={(e) =>
                    setFormData({ ...formData, github: e.target.value })
                  }
                  placeholder="https://github.com/username"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <Linkedin size={12} /> LINKEDIN URL
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <Globe size={12} /> PERSONAL WEBSITE
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://yourwebsite.com"
                  disabled={!isEditing}
                />
              </div>
            </form>
          </div>

          <div className="profile-sidebar-stack">
            {/* RIGHT SIDEBAR TOP: Resume Vault (Shifted Up) */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>RESUME VAULT</h3>
              </div>
              <div className="resume-vault-card">
                <div className="rv-main-content">
                  <div className="rv-icon-box bg-indigo-glow">
                    <FileText size={24} className="text-indigo" />
                  </div>
                  <div className="rv-info">
                    <h4 className="text-white">
                      {resumeName || "No Resume Synced"}
                    </h4>
                    <p className="text-muted">Central storage for AI modules</p>
                  </div>
                </div>

                <div className="rv-actions" style={{ display: 'flex', gap: '10px' }}>
                  {resumeName && (
                    <button 
                      className="rv-delete-btn" 
                      onClick={handleResumeDelete}
                      title="Remove Resume"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <label className="rv-upload-trigger" title={resumeName ? "Replace Resume" : "Upload New Resume"} style={{ background: resumeName ? 'rgba(255,255,255,0.05)' : '#6366f1', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {isUploading ? (
                      <Loader2 className="spin" size={18} />
                    ) : (
                      resumeName ? <RefreshCw size={18} /> : <Upload size={18} />
                    )}
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {resumeName && (
                <div className="rv-sync-status">
                  <CheckCircle size={14} />
                  <span>Enabled for Mock Interview & ATS</span>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR BOTTOM: Achievements (Shifted Down) */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>ACHIEVEMENTS</h3>
              </div>

              <div className="badges-list">
                <div className="badge-item active">
                  <div className="badge-icon-wrapper bg-indigo-glow">
                    <Award size={22} className="text-indigo" />
                  </div>
                  <div className="badge-text">
                    <h4>Early Adopter</h4>
                    <p>Member since Alpha v1.0</p>
                  </div>
                </div>

                <div className="badge-item active">
                  <div className="badge-icon-wrapper bg-blue-glow">
                    <Zap size={22} className="text-blue" />
                  </div>
                  <div className="badge-text">
                    <h4>Fast Learner</h4>
                    <p>Completed 3 sessions this week</p>
                  </div>
                </div>

                <div className="badge-item locked">
                  <div className="badge-icon-wrapper">
                    <Shield size={22} className="text-muted" />
                  </div>
                  <div className="badge-text">
                    <h4>Interview Master</h4>
                    <p>Unlock at 10 total sessions</p>
                    <div className="progress-bar-mini">
                      <div
                        className="fill"
                        style={{
                          width: `${Math.min((stats.interviews / 10) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
