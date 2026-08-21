# PrepAI — Interview Voice Engine Documentation

## 1. Executive Summary & Capabilities Inventory

The **PrepAI Interview Voice Engine** provides real-time, deterministic analysis of verbal communication during mock interviews. It computes speaking rate (WPM), filler word frequency, and pause patterns directly in the client using the Web Speech API and Web Audio API.

### Capability Status Classification

| Capability | Status | Implementation Mechanism | Privacy / Storage |
| :--- | :--- | :--- | :--- |
| **Microphone Stream Acquisition** | `IMPLEMENTED` | WebRTC `navigator.mediaDevices.getUserMedia` | Ephemeral browser audio context |
| **Speech-to-Text Transcription** | `IMPLEMENTED` | Browser Native `SpeechRecognition` | Client-side event stream |
| **Speaking WPM (Excl. Silence)** | `IMPLEMENTED` | $\text{words} / \text{speaking\_duration\_minutes}$ | Computed locally |
| **Deterministic Filler Detection** | `IMPLEMENTED` | Regex word boundary matching `\b(filler)\b` | No false substring positives |
| **Silence & RMS Volume Tracking** | `IMPLEMENTED` | Web Audio `AnalyserNode` (Time Domain RMS) | Polled every 150ms |
| **Pause Pattern Classification** | `IMPLEMENTED` | Natural thinking pauses vs prolonged silence (>3.5s) | Timestamp delta array |
| **Observable Voice Coaching** | `IMPLEMENTED` | Rule-based coaching engine | Stored in PostgreSQL JSONB |
| **Emotional / Stress Guessing** | `EXCLUDED BY DESIGN` | *Prohibited to maintain technical validity* | N/A |
| **Audio File Upload / Storage** | `EXCLUDED BY DESIGN` | *Never uploaded or saved to disk* | N/A |

---

## 2. Centralized Configuration Parameters (`VOICE_CONFIG`)

| Parameter | Type | Value | Rationale |
|---|---|---|---|
| `fillerWords` | `CONFIGURED` | `["um", "uh", "er", "ah", "like", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean", "right", "okay so"]` | Standard professional interview filler dictionary. |
| `silenceRmsThreshold` | `CONFIGURED` | `0.02` | Normalized audio energy threshold to separate speech from silence. |
| `minPauseDurationMs` | `CONFIGURED` | `1200` (1.2s) | Threshold to identify a deliberate thinking pause. |
| `prolongedSilenceThresholdMs` | `CONFIGURED` | `3500` (3.5s) | Threshold for extended thinking silence. |
| `targetWpmRange` | `CONFIGURED` | `[110, 165]` | Optimal conversational speaking pace for technical clarity. |
| `volumePollingIntervalMs` | `CONFIGURED` | `150` | Volume and silence polling interval. |

---

## 3. Mathematical Formulations & Observable Signal Taxonomy

### A. Speaking Words Per Minute (WPM) (`MEASURED` / `DERIVED`)
$$\text{Speaking Duration (min)} = \max\left(0.05, \frac{\text{Total Duration (ms)} - \text{Silence Duration (ms)}}{60000}\right)$$
$$\text{WPM} = \text{round}\left(\frac{\text{Words Spoken}}{\text{Speaking Duration (min)}}\right)$$

### B. Filler Word Density Percentage (`MEASURED`)
$$\text{Filler Density (\%)} = \left(\frac{\text{Filler Word Count}}{\max(1, \text{Total Words Spoken})}\right) \times 100$$

### C. Pause Pattern Statistics (`MEASURED`)
- $\text{Total Pauses}$: Count of silence events $\ge 1.2\text{s}$.
- $\text{Average Pause Duration}$: $\frac{\sum \text{Pause Durations}}{\text{Total Pauses}}$.
- $\text{Prolonged Silences}$: Count of pauses $\ge 3.5\text{s}$.

---

## 4. Hardware Fallback & Graceful Degradation (`UNAVAILABLE`)

When microphone access is denied or the browser does not support SpeechRecognition:
1. `voice_availability` is set to `"denied"` or `"unavailable"`.
2. The candidate can type answers directly into the transcript area.
3. The platform processes technical evaluation with 100% fidelity based on typed text.
