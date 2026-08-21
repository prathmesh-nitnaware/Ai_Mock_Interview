# PrepAI — Interview Camera Engine Documentation

## 1. Executive Summary & Capabilities Inventory

The **PrepAI Interview Camera Engine** provides deterministic, privacy-preserving, in-browser visual analysis during mock interviews. It extracts observable behavioral signals (face presence, framing bounds, gaze deviation, and movement stability) without sending raw video to external servers and without claiming unverified psychological states (such as dishonesty, nervousness, or deception).

### Capability Status Classification

| Capability | Status | Implementation Mechanism | Privacy / Storage |
| :--- | :--- | :--- | :--- |
| **Webcam Stream Acquisition** | `IMPLEMENTED` | WebRTC `navigator.mediaDevices.getUserMedia` | Ephemeral browser memory |
| **Face Detection & Centering** | `IMPLEMENTED` | `@vladmandic/face-api` (TinyFaceDetector, 224px) | Client-side WebGL / Canvas |
| **Temporal Smoothing (Hysteresis)** | `IMPLEMENTED` | 5 FPS (200ms) sampling + 800ms sustained window | In-memory session state |
| **Observable Gaze Alignment Proxy** | `IMPLEMENTED` | Facial bounding box coordinate offset | Deterministic ratio calculation |
| **Movement & Posture Stability** | `IMPLEMENTED` | Inter-frame Euclidean center point displacement | Score mapped (40–100 scale) |
| **Multi-Face Detection** | `IMPLEMENTED` | `detectAllFaces` count tracking | Client-side event counter |
| **Observable Delivery Coaching** | `IMPLEMENTED` | Rule-based coaching generation | Stored in PostgreSQL JSONB |
| **Psychological State Guessing** | `EXCLUDED BY DESIGN` | *Prohibited to ensure academic & hiring credibility* | N/A |
| **Raw Video Persistence** | `EXCLUDED BY DESIGN` | *Never transmitted to backend or third-party* | N/A |

---

## 2. Centralized Configuration Parameters (`CAMERA_CONFIG`)

| Parameter | Type | Value | Rationale |
|---|---|---|---|
| `sampleIntervalMs` | `CONFIGURED` | `200` | 5 FPS sampling rate; balances CPU efficiency with temporal resolution. |
| `scoreThreshold` | `CONFIGURED` | `0.5` | Minimum detector confidence to discard false positive detections. |
| `inputSize` | `CONFIGURED` | `224` | TinyFaceDetector input dimensions for fast inference. |
| `framingBounds` | `CONFIGURED` | `[0.20, 0.80] X, [0.15, 0.85] Y` | Optimal central zone for professional webcam alignment. |
| `faceSizeBounds` | `CONFIGURED` | `[0.03, 0.70]` | Minimum/maximum face bounding box area relative to frame size. |
| `sustainedGazeDeviationFrames` | `CONFIGURED` | `4` (~800ms) | Hysteresis filter: natural blinking/glancing is ignored; sustained deviation is flagged. |
| `excessiveMovementThreshold` | `CONFIGURED` | `0.08` | Normalized Euclidean displacement threshold between consecutive frames. |
| `multipleFaceThreshold` | `CONFIGURED` | `2` | Face count threshold to flag multi-individual interview settings. |

---

## 3. Mathematical Formulations & Observable Signal Taxonomy

### A. Face Presence Percentage (`MEASURED`)
$$\text{Face Presence (\%)} = \left( \frac{\text{Frames with Face Detected}}{\text{Total Sampled Frames}} \right) \times 100$$

### B. Face Framing Score (`DERIVED`)
$$\text{Face Framing Score} = \left( \frac{\text{Frames with Proper Centering \& Size}}{\text{Frames with Face Detected}} \right) \times 100$$

### C. Gaze Stability Score (`DERIVED`)
$$\text{Looking Away (\%)} = \left( \frac{\text{Frames with Sustained Gaze Offset}}{\text{Frames with Face Detected}} \right) \times 100$$
$$\text{Gaze Stability Score} = \max(20, \min(100, 100 - \text{Looking Away (\%) } ))$$

### D. Movement & Posture Stability Score (`DERIVED`)
$$\text{Movement Ratio} = \frac{\text{Frames with } \Delta > 0.08}{\text{Frames with Face Detected}}$$
$$\text{Movement Stability Score} = \max(40, \min(100, \text{round}(100 - (\text{Movement Ratio} \times 85))))$$

---

## 4. Hardware Fallback & Graceful Degradation (`UNAVAILABLE`)

When the user denies webcam access or if the device lacks a camera:
1. `camera_availability` is set to `"denied"` or `"unavailable"`.
2. The interview proceeds without interruption (candidate answers verbally or via typed fallback).
3. Delivery scoring handles missing video without penalizing candidate content score: Content (85%) carries 100% of final hiring determination.
