import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, UploadCloud, ArrowUpRight } from 'lucide-react';

export const ResumeStatusCard = ({ resumeName, isUploading, onUpload }) => {
  return (
    <div className="dash-panel-card resume-status-panel">
      <div className="dash-panel-header">
        <div className="dash-panel-title-wrap">
          <FileText size={18} className="dash-panel-icon" />
          <h3 className="dash-panel-title">Placement Resume</h3>
        </div>
        {resumeName ? (
          <span className="resume-synced-pill">
            <CheckCircle2 size={13} />
            <span>Synced to Vault</span>
          </span>
        ) : (
          <span className="resume-pending-pill">Not Uploaded</span>
        )}
      </div>

      {resumeName ? (
        <div className="resume-active-box">
          <div className="resume-info-group">
            <div className="resume-file-title">{resumeName}</div>
            <p className="resume-file-sub">
              Your resume skills and experience are actively tested during adaptive interviews.
            </p>
          </div>

          <div className="resume-actions-row">
            <Link to="/resume/result" className="btn-dash-secondary btn-sm">
              <span>View ATS Analysis</span>
              <ArrowUpRight size={14} />
            </Link>

            <label className="btn-dash-outline btn-sm">
              <UploadCloud size={14} />
              <span>{isUploading ? 'Uploading...' : 'Replace File'}</span>
              <input
                type="file"
                hidden
                accept=".pdf,.docx,.txt"
                onChange={onUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="resume-empty-box">
          <p className="resume-empty-prompt">
            Upload your latest resume to personalize your interview questions and enable AI skill validation.
          </p>

          <div className="resume-upload-cta">
            <label className="btn-dash-primary btn-sm">
              <UploadCloud size={14} />
              <span>{isUploading ? 'Uploading...' : 'Upload PDF Resume'}</span>
              <input
                type="file"
                hidden
                accept=".pdf,.docx,.txt"
                onChange={onUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeStatusCard;
