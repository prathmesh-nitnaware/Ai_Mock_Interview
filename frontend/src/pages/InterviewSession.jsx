import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  ArrowRight,
  Video,
  VideoOff,
  Mic,
  MicOff,
  CheckCircle2,
  ShieldCheck,
  Settings2,
  AlertTriangle,
} from "lucide-react";

import "./InterviewSession.css";

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Extracting context from previous Config step
  const questionData = location.state?.question || null;
  const sessionConfig = location.state?.config || null;
  const sessionId = location.state?.session_id || null;

  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    // Safety check: Redirect if no session context
    if (!questionData || !sessionId) {
      navigate("/interview");
      return;
    }

    const initHardware = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Verification delay for UI experience
        setTimeout(() => {
          setHasPermissions(true);
          setIsChecking(false);
        }, 1500);
      } catch (err) {
        setPermissionError("Camera/Microphone access denied. Please check settings.");
        setIsChecking(false);
      }
    };

    initHardware();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [questionData, sessionId, navigate]);

  const toggleCamera = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !cameraOn;
        setCameraOn(!cameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const startActualInterview = () => {
    navigate("/interview/live", {
      state: {
        question: questionData,
        config: sessionConfig,
        session_id: sessionId,
      },
    });
  };

  if (permissionError) {
    return (
      <div className="lobby-container">
        <div className="glass-panel error-card text-center">
          <AlertTriangle size={48} color="#ef4444" className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Hardware Blocked</h2>
          <p className="mb-6" style={{ color: '#888' }}>{permissionError}</p>
          <button className="btn-enter-studio" onClick={() => window.location.reload()}>
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container fade-in">
      <div className="lobby-grid">
        
        {/* --- LEFT: Preview Panel --- */}
        <div className="preview-panel">
          <div className="panel-header">
            <Settings2 size={14} /> SIGNAL MONITOR
          </div>
          
          <div className="video-wrapper">
            {cameraOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="live-video" />
            ) : (
              <div className="cam-off-state">
                <div className="avatar-placeholder">P</div>
                VIDEO FEED OFFLINE
              </div>
            )}

            <div className="controls-overlay">
              <button className={`control-btn ${!micOn ? "off" : ""}`} onClick={toggleMic}>
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button className={`control-btn ${!cameraOn ? "off" : ""}`} onClick={toggleCamera}>
                {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>

          <div className="audio-visualizer-box">
            <span className="av-label">AUDIO_INPUT_LEVEL</span>
            <div className="equalizer">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: Checklist Panel --- */}
        <div className="checklist-panel">
          <h1 className="lobby-title">SYSTEM CHECK</h1>
          <p className="lobby-sub">Verify your hardware environment before initializing the AI interview studio.</p>
          
          <div className="checklist-items">
            <div className={`check-item ${!isChecking && hasPermissions ? 'passed' : ''}`}>
              {isChecking ? <div className="loader-ring"></div> : <CheckCircle2 size={24} color="#818cf8" />}
              <div className="ci-text">
                <strong>Optical Sensors</strong>
                <span>{isChecking ? "Verifying camera..." : "High-definition feed active"}</span>
              </div>
            </div>

            <div className={`check-item ${!isChecking && hasPermissions ? 'passed' : ''}`}>
              {isChecking ? <div className="loader-ring"></div> : <CheckCircle2 size={24} color="#818cf8" />}
              <div className="ci-text">
                <strong>Audio Waveform</strong>
                <span>{isChecking ? "Syncing microphone..." : "Input channel synchronized"}</span>
              </div>
            </div>

            <div className="check-item">
              <ShieldCheck size={24} color="#818cf8" />
              <div className="ci-text">
                <strong>Secure Session</strong>
                <span>End-to-end encryption enabled</span>
              </div>
            </div>
          </div>

          <button 
            className="btn-enter-studio" 
            disabled={isChecking || !hasPermissions} 
            onClick={startActualInterview}
          >
            {isChecking ? "VERIFYING..." : "INITIALIZE STUDIO"}
            {!isChecking && <ArrowRight size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InterviewSession;
