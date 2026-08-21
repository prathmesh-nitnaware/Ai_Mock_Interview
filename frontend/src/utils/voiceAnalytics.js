/**
 * frontend/src/utils/voiceAnalytics.js
 * =====================================
 * Deterministic Voice & Speech Communication Analytics Engine for PrepAI.
 * 
 * CORE PRINCIPLES:
 * 1. Computes deterministic communication metrics (WPM, filler word density, pause frequency, speech duration).
 * 2. WPM uses actual speaking duration (excluding silence/prolonged pauses) for true articulation pace.
 * 3. ZERO psychological or emotional inferences (no claims of insecurity, nervousness, or low confidence).
 * 4. Hardware resilience: Missing or denied microphone handles typed fallback cleanly without score penalties.
 * 5. All audio analysis is performed in-memory via Web Audio API; zero audio is recorded or persisted.
 */

export const VOICE_CONFIG = {
  fillerWords: [
    "um",
    "uh",
    "er",
    "ah",
    "like",
    "you know",
    "basically",
    "actually",
    "literally",
    "sort of",
    "kind of",
    "i mean",
    "right",
    "okay so",
  ],
  silenceRmsThreshold: 0.02,         // Normalized RMS volume threshold for speech detection
  minPauseDurationMs: 1200,          // 1.2s threshold to identify a deliberate thinking pause
  prolongedSilenceThresholdMs: 3500, // 3.5s threshold for an extended silence event
  targetWpmRange: {
    min: 110,
    max: 165,
  },
  volumePollingIntervalMs: 150,
};

export class VoiceAnalyticsEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.mediaStream = null;
    this.volumeCheckInterval = null;
    this.voiceAvailability = "unavailable"; // 'available' | 'unavailable' | 'denied'

    this.isListening = false;
    this.startTime = null;
    this.lastSpeechTime = null;
    this.totalSpeakingDurationMs = 0;
    this.totalSilenceDurationMs = 0;
    
    // Pause tracking
    this.pauses = [];
    this.currentSilenceStart = null;

    // Speech Volume
    this.currentVolume = 0;
  }

  /**
   * Initializes Web Audio API for real-time volume and silence tracking.
   */
  async initializeAudioMonitoring(stream) {
    if (!stream) {
      this.voiceAvailability = "unavailable";
      return;
    }

    try {
      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        this.voiceAvailability = "unavailable";
        return;
      }

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.4;

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      this.voiceAvailability = "available";
      this._startVolumePolling();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("AudioContext monitoring initialization skipped or failed:", err);
      }
      this.voiceAvailability = "unavailable";
    }
  }

  _startVolumePolling() {
    if (this.volumeCheckInterval) clearInterval(this.volumeCheckInterval);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.volumeCheckInterval = setInterval(() => {
      if (!this.analyser || !this.isListening) return;

      this.analyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0.0;
      for (let i = 0; i < dataArray.length; i++) {
        const norm = (dataArray[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      this.currentVolume = Math.min(100, Math.round(rms * 250));

      const now = Date.now();
      const isSpeaking = rms > VOICE_CONFIG.silenceRmsThreshold;

      if (isSpeaking) {
        if (this.currentSilenceStart) {
          const silenceDuration = now - this.currentSilenceStart;
          if (silenceDuration >= VOICE_CONFIG.minPauseDurationMs) {
            this.pauses.push(silenceDuration);
          }
          this.totalSilenceDurationMs += silenceDuration;
          this.currentSilenceStart = null;
        }
        this.lastSpeechTime = now;
      } else {
        if (!this.currentSilenceStart) {
          this.currentSilenceStart = now;
        }
      }
    }, VOICE_CONFIG.volumePollingIntervalMs);
  }

  startSession() {
    this.isListening = true;
    this.startTime = Date.now();
    this.lastSpeechTime = Date.now();
    this.pauses = [];
    this.currentSilenceStart = null;
    this.totalSpeakingDurationMs = 0;
    this.totalSilenceDurationMs = 0;
  }

  stopSession() {
    this.isListening = false;
    const now = Date.now();
    if (this.currentSilenceStart) {
      const silenceDuration = now - this.currentSilenceStart;
      if (silenceDuration >= VOICE_CONFIG.minPauseDurationMs) {
        this.pauses.push(silenceDuration);
      }
      this.totalSilenceDurationMs += silenceDuration;
      this.currentSilenceStart = null;
    }
  }

  setPermissionDenied() {
    this.voiceAvailability = "denied";
    this.cleanup();
  }

  cleanup() {
    this.stopSession();
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
    }
  }

  /**
   * Computes comprehensive objective voice communication metrics from transcript and session timing.
   */
  computeMetrics(transcript, customDurationMs = null) {
    const rawText = (transcript || "").trim();
    const words = rawText.length > 0 ? rawText.split(/\s+/).filter(w => w.length > 0) : [];
    const wordCount = words.length;

    // Handle missing audio / zero input
    if (wordCount === 0 && !this.startTime && !customDurationMs) {
      return {
        voice_available: false,
        voice_availability: this.voiceAvailability,
        words_spoken: 0,
        wpm: 0,
        pace_rating: "No Audio Input",
        filler_word_count: 0,
        filler_word_rate_pct: 0.0,
        detected_fillers: {},
        pause_count: 0,
        avg_pause_ms: 0,
        longest_pause_ms: 0,
        total_duration_ms: 0,
        speaking_duration_ms: 0,
        silence_duration_ms: 0,
        coaching_tips: ["No audio or transcript detected. Type or speak an answer to receive communication feedback."],
      };
    }

    const totalDurationMs = customDurationMs || (this.startTime ? Math.max(1000, Date.now() - this.startTime) : 1000);
    const silenceMs = Math.min(totalDurationMs, this.totalSilenceDurationMs);
    const speakingMs = Math.max(500, totalDurationMs - silenceMs);

    // 1. Speaking Pace (Words Per Speaking Minute - excludes long silence)
    const speakingMinutes = speakingMs / 60000.0;
    const wpm = wordCount > 0 ? Math.round(wordCount / Math.max(0.05, speakingMinutes)) : 0;

    // 2. Filler Word Detection (Deterministic regex word-boundary match)
    let fillerCount = 0;
    const detectedFillers = {};
    const lowerText = ` ${rawText.toLowerCase().replace(/[^a-z0-9\s]/g, " ")} `;

    for (const filler of VOICE_CONFIG.fillerWords) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        const count = matches.length;
        fillerCount += count;
        detectedFillers[filler] = count;
      }
    }

    const fillerRatePct = wordCount > 0 ? Math.round((fillerCount / wordCount) * 1000) / 10 : 0.0;

    // 3. Pause Statistics
    const pauseCount = this.pauses.length;
    const avgPauseMs = pauseCount > 0 ? Math.round(this.pauses.reduce((a, b) => a + b, 0) / pauseCount) : 0;
    const longestPauseMs = pauseCount > 0 ? Math.max(...this.pauses) : 0;
    const prolongedPauseCount = this.pauses.filter(p => p >= VOICE_CONFIG.prolongedSilenceThresholdMs).length;

    // 4. Delivery Pace Assessment
    let paceRating = "Optimal Conversational";
    if (wpm > 0 && wpm < VOICE_CONFIG.targetWpmRange.min) paceRating = "Deliberate / Measured";
    else if (wpm >= VOICE_CONFIG.targetWpmRange.min && wpm <= VOICE_CONFIG.targetWpmRange.max) paceRating = "Optimal Conversational";
    else if (wpm > VOICE_CONFIG.targetWpmRange.max) paceRating = "Fast / Brisk";

    // 5. Actionable Delivery Coaching (Purely observable, zero psychological inferences)
    const coachingTips = [];

    if (wpm > VOICE_CONFIG.targetWpmRange.max) {
      coachingTips.push(`Speaking pace was ${wpm} WPM. Pacing around 125-155 WPM allows the interviewer to follow complex architectural reasoning more easily.`);
    } else if (wpm > 0 && wpm < 95) {
      coachingTips.push(`Speaking pace was ${wpm} WPM. Aiming for 115-140 WPM maintains a steady conversational rhythm.`);
    } else if (wpm >= VOICE_CONFIG.targetWpmRange.min && wpm <= VOICE_CONFIG.targetWpmRange.max) {
      coachingTips.push("Speaking pace was well-regulated within the standard interview target range (110-165 WPM).");
    }

    if (fillerRatePct > 5.0) {
      const topFillers = Object.entries(detectedFillers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => `'${k}'`)
        .join(" and ");
      coachingTips.push(`Filler word density was ${fillerRatePct}%. Practice taking brief, silent pauses instead of using placeholder words like ${topFillers}.`);
    } else if (wordCount >= 20 && fillerRatePct <= 2.5) {
      coachingTips.push("Clean verbal delivery with low filler word frequency.");
    }

    if (prolongedPauseCount > 0) {
      coachingTips.push(`Observed ${prolongedPauseCount} extended silence(s) (>3.5s). Verbalizing your thought process while formulating answers is effective during technical rounds.`);
    } else if (pauseCount > 0) {
      coachingTips.push("Effective use of short, natural pauses between technical concepts.");
    }

    return {
      voice_available: true,
      voice_availability: this.voiceAvailability,
      speaking_duration_ms: Math.round(speakingMs),
      silence_duration_ms: Math.round(silenceMs),
      total_duration_ms: Math.round(totalDurationMs),
      words_spoken: wordCount,
      wpm: wpm,
      pace_rating: paceRating,
      filler_word_count: fillerCount,
      filler_word_rate_pct: fillerRatePct,
      detected_fillers: detectedFillers,
      pause_count: pauseCount,
      avg_pause_ms: avgPauseMs,
      longest_pause_ms: longestPauseMs,
      prolonged_pause_count: prolongedPauseCount,
      coaching_tips: coachingTips,
    };
  }
}

export const defaultVoiceEngine = new VoiceAnalyticsEngine();
