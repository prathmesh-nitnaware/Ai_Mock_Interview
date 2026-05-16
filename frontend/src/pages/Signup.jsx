import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css'; 
import './Signup.css'; 

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Frontend Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Data Preparation
    // Passing as an object ensures your AuthContext/API layer receives the correct keys
    const signupPayload = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    try {
      const result = await signup(signupPayload);
      
      if (result && result.success) {
        // Redirect to onboarding on successful account initialization
        navigate('/onboarding'); 
      } else {
        setError(result?.message || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setError(err?.error || "A connection error occurred. Is the backend running?");
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-split">
        
        {/* --- Left Side: Visual / Value Prop --- */}
        <div className="signup-visual">
          <div className="ambient-glow-brand"></div>
          <div className="noise-overlay"></div>
          
          <div className="visual-content fade-in-up">
            <div className="brand-pill-light mb-6">
              <Sparkles size={14} className="text-indigo-light" />
              <span>PREP AI 2.0</span>
            </div>
            
            <h1 className="visual-heading">Join the <br/> Elite.</h1>
            <p className="visual-text">
              Master your interview skills with AI-driven analysis. Join professionals securing roles at top-tier tech companies.
            </p>

            <ul className="value-props-list mt-8">
              <li><CheckCircle2 size={18} className="text-success" /> Real-time Voice & Pace Analysis</li>
              <li><CheckCircle2 size={18} className="text-success" /> Contextual ATS Resume Scoring</li>
              <li><CheckCircle2 size={18} className="text-success" /> Personalized Coding Dojo</li>
            </ul>
          </div>
          
          <div className="visual-footer fade-in-up delay-200">
            <span>SECURE ENCLAVE</span>
            <span>SYSTEM.ONLINE</span>
          </div>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="signup-form-container">
          <div className="ambient-glow-mobile"></div>

          {/* Glassmorphism Container */}
          <div className="glass-signup-card fade-in-up delay-200">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Initialize your personalized training environment.</p>
            </div>

            {error && (
              <div className="error-pill shake-animation">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="input-wrapper">
                  <InputField
                    label="FULL NAME"
                    name="name"
                    placeholder="E.g. Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    icon={<User size={16} />}
                    required
                  />
              </div>

              <div className="input-wrapper">
                  <InputField
                    type="email"
                    label="EMAIL ADDRESS"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail size={16} />}
                    required
                  />
              </div>

              <div className="password-grid">
                <div className="input-wrapper">
                    <InputField
                      type="password"
                      label="PASSWORD"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      icon={<Lock size={16} />}
                      required
                    />
                </div>
                <div className="input-wrapper">
                    <InputField
                      type="password"
                      label="CONFIRM"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      icon={<Lock size={16} />}
                      required
                    />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="btn-glow-submit w-full mt-6" 
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "INITIALIZING..." : <> Initialize Account <ArrowRight size={16} /> </>}
              </Button>
            </form>

            <div className="form-footer">
              <p>Already a member? <Link to="/login" className="link-highlight">Secure Log In</Link></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;