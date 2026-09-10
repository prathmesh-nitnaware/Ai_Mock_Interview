import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './GoogleAccountModal.css';

// Preset real Google Gmail accounts for quick one-click selection
const PRESET_ACCOUNTS = [
  { name: 'PRATHMESH NITNAWARE', email: 'prathmeshnitnaware123@gmail.com' },
  { name: 'Admin Account',        email: 'admin@gmail.com' },
  { name: 'Prashant Lokhande',    email: 'pslokhande@gmail.com' },
];

const GoogleAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (account) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await loginWithGoogle({
        email: account.email,
        name: account.name,
        google_id: `google_${Date.now()}`
      });

      if (result.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(result.message || 'Google account linking failed.');
      }
    } catch (err) {
      setError('Connection error during Google account sign-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid Gmail address.');
      return;
    }

    const name = customName.trim() || cleanEmail.split('@')[0];
    await handleSelectAccount({ name, email: cleanEmail });
  };

  return (
    <div className="google-modal-overlay" onClick={onClose}>
      <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="google-modal-header">
          <button onClick={onClose} className="google-modal-close-btn" title="Close">
            <X size={18} />
          </button>
          
          <div className="google-brand-icon-box">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>

          <h2 className="google-modal-title">Sign in with Google</h2>
          <p className="google-modal-subtitle">
            Select a Gmail account to link with PrepAI
          </p>
        </header>

        {error && (
          <div style={{
            background: 'var(--danger-subtle)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Account Selector List */}
        <div className="google-accounts-list">
          {PRESET_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              className="google-account-item"
              onClick={() => handleSelectAccount(acc)}
              disabled={submitting}
            >
              <div className="google-account-avatar">
                {acc.name.charAt(0).toUpperCase()}
              </div>
              <div className="google-account-details">
                <span className="google-account-name">{acc.name}</span>
                <span className="google-account-email">{acc.email}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Gmail Input Toggle */}
        {!showCustomInput ? (
          <button
            type="button"
            className="google-account-item"
            style={{ justifyContent: 'center', background: 'transparent', borderStyle: 'dashed' }}
            onClick={() => setShowCustomInput(true)}
          >
            <UserPlus size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
              Use another Gmail account
            </span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="google-add-account-box">
            <div className="google-input-label">Enter Your Gmail Account</div>
            <input
              type="email"
              className="google-custom-input"
              placeholder="name@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              autoFocus
              required
            />
            <input
              type="text"
              className="google-custom-input"
              placeholder="Full Name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <button
              type="submit"
              className="btn-google-submit"
              disabled={submitting || !customEmail.trim()}
            >
              {submitting ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <>
                  <span>Link Google Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        <footer className="google-modal-footer">
          To continue, Google will share your name, email address, and profile picture with PrepAI.
        </footer>
      </div>
    </div>
  );
};

export default GoogleAccountModal;
