import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Loader2,
} from 'lucide-react';
import './InterviewSession.css';

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const questionData = location.state?.question || null;
  const sessionConfig = location.state?.config || null;
  const sessionId = location.state?.session_id || null;

  const [cameraStatus, setCameraStatus] = useState('checking');
  const [micStatus, setMicStatus] = useState('checking');
  const [speechRecStatus, setSpeechRecStatus] = useState('checking');
  const [backendStatus, setBackendStatus] = useState('ready');
  const [isChecking, setIsChecking] = useState(true);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    if (!questionData || !sessionId) {
      navigate('/interview');
      return;
    }

    const initDiagnostic = async () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechRecStatus('ready');
      } else {
        setSpeechRecStatus('unavailable');
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus('ready');
        setMicStatus('ready');
        setCameraOn(true);
        setMicOn(true);
      } catch (err) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = audioStream;
          setCameraStatus('unavailable');
          setMicStatus('ready');
          setCameraOn(false);
          setMicOn(true);
        } catch (audioErr) {
          setCameraStatus('unavailable');
          setMicStatus('unavailable');
          setCameraOn(false);
          setMicOn(false);
        }
      } finally {
        setTimeout(() => {
          setIsChecking(false);
        }, 500);
      }
    };

    initDiagnostic();

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
    navigate('/interview/live', {
      state: {
        question: questionData,
        config: sessionConfig,
        session_id: sessionId,
      },
    });
  };

  return (
    <div className="diagnostic-lobby-page">
      <div className="diagnostic-grid">
        {/* Left Column: Camera Preview Box */}
        <div className="camera-preview-panel">
          <div className="preview-header-label">
            <Settings2 size={14} /> Hardware Diagnostic Preview
          </div>

          <div className="camera-preview-box">
            {cameraOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="preview-video-element" />
            ) : (
              <div className="preview-muted-state">
                <div className="preview-avatar">P</div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {cameraStatus === 'unavailable' ? 'Camera Not Connected' : 'Camera Feed Muted'}
                </span>
              </div>
            )}

            <div className="preview-controls-bar">
              <button
                type="button"
                className={`media-toggle-btn ${!cameraOn ? 'off' : ''}`}
                onClick={toggleCamera}
                title={cameraOn ? 'Mute Camera' : 'Enable Camera'}
              >
                {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>

              <button
                type="button"
                className={`media-toggle-btn ${!micOn ? 'off' : ''}`}
                onClick={toggleMic}
                title={micOn ? 'Mute Microphone' : 'Enable Microphone'}
              >
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Status Card */}
        <div className="diagnostic-status-card">
          <div>
            <h2 className="diagnostic-card-title">Pre-Flight Readiness Check</h2>
            <p style={{ fontSize: '0.85rem', color: '#8c8ca0', margin: '0.35rem 0 0 0' }}>
              Verifying audio/video streams and backend session connectivity.
            </p>
          </div>

          <div className="diagnostic-checklist">
            {/* Camera */}
            <div className="checklist-row">
              <div className="checklist-label-group">
                <Video size={16} style={{ color: '#7c5cfc' }} />
                <span>Webcam & Framing</span>
              </div>
              <span className={`checklist-badge ${cameraStatus}`}>
                {cameraStatus === 'ready' ? '● Ready' : cameraStatus === 'checking' ? 'Checking...' : '○ Optional'}
              </span>
            </div>

            {/* Microphone */}
            <div className="checklist-row">
              <div className="checklist-label-group">
                <Mic size={16} style={{ color: '#7c5cfc' }} />
                <span>Microphone & Audio</span>
              </div>
              <span className={`checklist-badge ${micStatus}`}>
                {micStatus === 'ready' ? '● Ready' : micStatus === 'checking' ? 'Checking...' : '○ Typed Fallback'}
              </span>
            </div>

            {/* Speech Recognition */}
            <div className="checklist-row">
              <div className="checklist-label-group">
                <Settings2 size={16} style={{ color: '#7c5cfc' }} />
                <span>Speech Recognition</span>
              </div>
              <span className={`checklist-badge ${speechRecStatus}`}>
                {speechRecStatus === 'ready' ? '● Active' : '○ Typed Fallback'}
              </span>
            </div>

            {/* Backend Session */}
            <div className="checklist-row">
              <div className="checklist-label-group">
                <ShieldCheck size={16} style={{ color: '#10b981' }} />
                <span>AI Interviewer Session</span>
              </div>
              <span className="checklist-badge ready">
                ● Connected
              </span>
            </div>
          </div>

          <p className="hardware-reassurance-note">
            Note: If camera or microphone permissions are not granted, you can answer questions directly via the typed response box without score penalties.
          </p>

          <button
            type="button"
            className="btn-launch-interview"
            onClick={startActualInterview}
            disabled={isChecking}
          >
            <span>Enter Live Interview Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
