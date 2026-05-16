import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Mic, MicOff, Zap, ChevronRight, Loader2, MessageSquare, Activity } from "lucide-react";
import * as faceapi from '@vladmandic/face-api';
import "./InterviewLive.css";

const InterviewLive = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = location.state?.session_id;
  const config = location.state?.config || { role: "General", intensity: 5 };
  const MAX_QUESTIONS = parseInt(config.intensity) || 5;
  const initialQuestion = location.state?.question || { title: "Initializing...", description: "Preparing environment..." };

  const [question, setQuestion] = useState(initialQuestion);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [userAnswer, setUserAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Face API State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [nervousnessScore, setNervousnessScore] = useState(0);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!sessionId) { navigate("/interview"); return; }
    setupSpeechRecognition();
    startCamera();
    loadFaceModels();
    if (question?.description) speakText(question.description);
    return () => {
      window.speechSynthesis.cancel();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const loadFaceModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      setModelsLoaded(true);
    } catch (err) {
      console.error("Error loading face API models:", err);
    }
  };

  useEffect(() => {
    if (!modelsLoaded || !videoRef.current) return;
    
    const intervalId = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detections = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();
        
        if (detections) {
          const exprs = detections.expressions;
          // Combine fearful, sad, and surprised as proxy for nervousness (max 100)
          const score = Math.min(100, (exprs.fearful * 0.5 + exprs.sad * 0.2 + exprs.surprised * 0.3) * 100);
          setNervousnessScore(Math.round(score));
        }
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [modelsLoaded, videoRef]);

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join("");
      setUserAnswer(transcript);
    };
    recognitionRef.current = recognition;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { console.warn("Cam off"); }
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { setUserAnswer(""); recognitionRef.current.start(); setIsListening(true); }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    if (isListening) toggleListening();
    setSubmitting(true);
    try {
      // Note: mapping response to handle your specific backend 'submit' route
      const response = await api.client.post("/api/interview/submit", {
        session_id: sessionId,
        answer: userAnswer,
        question_title: question.title,
        nervousness_score: nervousnessScore
      });
      
      const feedback = response.data.review;
      setAiFeedback(feedback);
      
      setSessionHistory(prev => [...prev, { 
        question: question.title, 
        answer: userAnswer, 
        feedback: feedback,
        metrics: { wpm: 0, filler_words: 0, nervousness: nervousnessScore } // Default metrics to prevent report crashes
      }]);

      if (feedback.feedback) speakText(feedback.feedback);
    } catch (err) { alert("Sync failed"); }
    finally { setSubmitting(false); }
  };

  const handleNextQuestion = async () => {
    if (questionIndex >= MAX_QUESTIONS) {
      navigate("/interview/report", { state: { history: sessionHistory, config } });
      return;
    }
    setLoadingNext(true);
    try {
      const nextQ = await api.client.post("/api/interview/next", { session_id: sessionId });
      setQuestion(nextQ.data);
      setQuestionIndex(prev => prev + 1);
      setUserAnswer("");
      setAiFeedback(null);
      speakText(nextQ.data.description);
    } catch { alert("Error"); }
    finally { setLoadingNext(false); }
  };

  return (
    <div className="live-root">
      <div className="noise-bg"></div>
      <div className="live-glow"></div>

      <div className="live-layout">
        <div className="interviewer-panel">
          <div className="session-badge">
            <Zap size={14} className="text-indigo" /> 
            STAGE {questionIndex} OF {MAX_QUESTIONS}
          </div>

          <div className={`ai-orb-container ${isAiSpeaking ? 'is-speaking' : ''}`}>
            <div className="ai-orb"></div>
            <div className="ai-orb-ring"></div>
          </div>

          <h1 className="problem-title">{question.title}</h1>
          <div className="desc-box glass-card">{question.description}</div>

          {aiFeedback && (
            <div className="feedback-toast glass-card fade-in-up">
              <div className="toast-tag"><MessageSquare size={14}/> EVALUATION</div>
              <p>{aiFeedback.feedback}</p>
            </div>
          )}
        </div>

        <div className="input-panel">
          <div className="input-header">
            <span>TRANSCRIPT_FEED</span>
            <div className="status-dot"></div>
          </div>
          <textarea
            className="transcript-area glass-card"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="AI is monitoring audio... speak or type your answer here."
          />

          <div className="live-actions">
            <button className={`mic-btn ${isListening ? "active" : ""}`} onClick={toggleListening}>
              {isListening ? <MicOff /> : <Mic />}
            </button>

            {!aiFeedback ? (
              <button className="submit-btn-glow" onClick={handleSubmit} disabled={submitting || !userAnswer}>
                {submitting ? <Loader2 className="spin" /> : "SUBMIT RESPONSE"}
              </button>
            ) : (
              <button className="next-btn-glow" onClick={handleNextQuestion} disabled={loadingNext}>
                {loadingNext ? <Loader2 className="spin" /> : (
                  <> {questionIndex >= MAX_QUESTIONS ? "FINISH SESSION" : "NEXT STAGE"} <ChevronRight size={18} /> </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="floating-cam glass-card">
        <video ref={videoRef} autoPlay muted playsInline className="self-video" />
        <div className="cam-overlay">
          LIVE_CANDIDATE
          <div className="nervousness-tracker">
            <Activity size={14} className={nervousnessScore > 50 ? "text-red" : "text-green"} />
            <span>Stress: {nervousnessScore}%</span>
            {!modelsLoaded && <span className="loading-models"> (Loading AI...)</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLive;
