# 💎 PrepAI: The Paradigm of Multimodal Interview Intelligence

<div align="center">
  <img src="readme_banner.png" alt="PrepAI Banner" width="100%" style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

  <h3>"The only technical interview simulator you will ever need."</h3>

  <p align="center">
    <img src="https://img.shields.io/badge/AI--Orchestrator-Enterprise--Grade-blueviolet?style=for-the-badge&logo=openai" alt="AI">
    <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="Database">
    <img src="https://img.shields.io/badge/Backend-Flask--Hyperdrive-333333?style=for-the-badge&logo=flask" alt="Backend">
    <img src="https://img.shields.io/badge/Frontend-React--18--Atomic-61DAFB?style=for-the-badge&logo=react" alt="Frontend">
  </p>

  <p align="center">
    <b>Revolutionizing Professional Readiness through Neural Networks, Computer Vision, and Predictive Analytics.</b>
  </p>
</div>

---

## 🌌 The Vision
**PrepAI** isn't just an app; it's a **behavioral laboratory**. Traditionally, interview prep is static and one-dimensional. PrepAI shatters this limitation by creating a **synchronous feedback loop** between your technical output, your biological signals (gaze, posture), and world-class AI reasoning.

Whether you're a Junior dev or a Senior Architect, PrepAI scales its cognitive complexity to match yours, ensuring you are battle-tested for the world's most rigorous technical screens.

---

## 🚀 Core Functionalities (The "Master" List)

### 🎙️ 1. Dynamic Scenario Stimulator (Mock Interviews)
*   **Adaptive Heuristics**: Generates questions based on a real-time analysis of your resume text synced with your target job role.
*   **Cognitive Persistence**: Every session is tracked. The AI remembers your past answers within a session to generate complex follow-up questions.
*   **Performance Profiling**: Instant feedback on Clarity, Confidence, and Technical Depth with actionable improvements.

### 💻 2. The Coding Dojo (Neural IDE)
*   **Algorithmic Mastery**: Over 50+ curated challenges ranging from O(n) basics to Hard Dynamic Programming.
*   **Monaco Engine Synergy**: The same core powering VS Code, providing a professional-grade editor with syntax highlighting and auto-indentation.
*   **Automated Quality Review**: Instead of simple unit tests, an AI Reviewer analyzes code for **time/space complexity**, **edge cases**, and **clean code principles (SOLID/DRY)**.

### 📝 3. Resume Intelligence & ATS Counter-Measures
*   **Semantic ATS Scoring**: A predictive model that rates your resume against specific job descriptions.
*   **Deep-Dive Analysis**: Evaluates your resume to identify Core Strengths, Critical Weaknesses, and Missing Keywords to beat ATS bots.
*   **Global Resume Vault**: Upload your resume to your dashboard once, and securely use it across all AI modules globally.

### 👁️ 4. Behavioral Biometrics (CV Analysis)
*   **Gaze Stability Monitoring**: Detects if you are reading from off-screen notes or maintaining digital eye contact.
*   **Posture & Presence Analytics**: Monitors slouching, shoulder alignment, and involuntary movements.

### 🔐 5. Smart Onboarding & Profile Tracking
*   **Frictionless Onboarding**: Tailors the platform to your education, current job, and target role the second you sign up.
*   **Progression Tracking**: Automatically saves your interview transcripts and scores in MongoDB for historical tracking.

---

## 🛠️ The Advanced Tech Stack (Deep Dive)

### 🧠 Distributed Intelligence
- **AI Core Orchestrator**: A hybrid decision-gate system that primarily routes requests to **Ollama (Llama 3)** for low-latency local inference.
- **Hierarchical Prompt Engineering**: Utilizes few-shot prompting and system-instruction layering to ensure JSON-strict outputs and persona consistency.

### ⚡ Reactive Frontend & State
- **React 18 Architecture**: Leveraging Atomic Design Principles for a modular, reusable component library.
- **Vite Ecosystem**: HMR (Hot Module Replacement) enabled for high-speed development and ultra-optimized production bundles.
- **Executive Light Design**: A premium, minimalist UI system using high-contrast glassmorphism and subtle Framer Motion micro-animations.

### 🛡️ Enterprise Backend & Security
- **Flask Micro-Services**: Blueprint-based routing to ensure modularity and horizontal scalability.
- **JWT Protection Tiers**: Secure authentication using industry-standard tokenization for session persistence.
- **MongoDB Interoperability**: Utilizing BSON for heterogeneous data storage, including Base64 PDF blobs and session transcripts.

---

## 📂 Project Anatomy

```text
Prep_AI/
├── frontend/               # The Reactive Visual Interface (React/Vite)
│   ├── src/
│   │   ├── components/     # Atomic UI Elements (Glassmorphic Forms, Buttons)
│   │   ├── context/        # Global State Management (AuthContext)
│   │   ├── pages/          # Full-Page View Controllers (Dashboard, Onboarding, Dojo)
│   │   └── services/       # Centralized API Orchestration Layer (Axios)
│   └── package.json
├── backend/                # The Neural Operations Core (Flask)
│   ├── routes/             # Blueprint-based API Endpoints
│   ├── utils/              # Providers (AI, CV, Auth, Parser)
│   ├── models/             # Schema-less Data Definitions (Users, Interivews)
│   ├── scripts/            # Infrastructure Management (init_db.py)
│   ├── main.py             # System Gateway & WebSocket Entry Point
│   └── requirements.txt    # Python Dependencies
├── ml/                     # Machine Learning Research Laboratory
├── package.json            # Root orchestrator (Concurrent runner)
└── PROJECT_STATE.md        # Technical architectural notes
```

---

## 🔧 Step-by-Step Installation & Setup Guide

To run PrepAI on your local machine, you will need **Node.js**, **Python 3.10+**, **MongoDB**, and **Ollama**. Follow these instructions precisely.

### Step 1: Prerequisites Check
1. Install [Node.js](https://nodejs.org/en) (v18 or higher recommended).
2. Install [Python](https://www.python.org/downloads/) (3.10 or higher).
3. Install [Ollama](https://ollama.com/) (Required for local AI features).

### Step 2: Download AI Models
PrepAI uses Meta's Llama 3 model for robust, local AI processing. Open your terminal and run:
```bash
ollama run llama3:8b
```
*(Note: The model is ~4.7GB and will take a few minutes to download depending on your internet connection).*

### Step 3: Database Configuration (MongoDB)
1. You can either use a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster or a local MongoDB installation.
2. In the `backend/` directory, create a `.env` file (if one does not exist) or edit the existing one.
3. Configure your connection string:
   ```env
   # Database Configuration
   MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=prepai
   
   # Security
   SECRET_KEY=your_super_secret_jwt_key
   
   # AI Configuration
   AI_PROVIDER=ollama
   OLLAMA_MODEL=llama3:8b
   OLLAMA_HOST=http://127.0.0.1:11434
   
   # Port Configuration
   PORT=5000
   ```

### Step 4: Install Dependencies
PrepAI utilizes a Monorepo structure. You can install all dependencies from the root directory with a single command:
```bash
npm run install-all
```
*(This command will automatically install the React frontend packages, create a Python virtual environment in the backend, and install all Python requirements).*

### Step 5: Initialize the Database
Before running the app, you need to configure your MongoDB collections and indexes (ensures emails are unique, etc.):
```bash
# Navigate to the backend directory
cd backend

# Activate your virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Run the initialization script
python scripts/init_db.py
```
*You should see a "Database initialization completed successfully!" message.*

---

## 🚀 How to Run the Project

You can boot up the entire stack—both the React Frontend and the Flask Backend—with a single command from the **root directory (`Prep_AI/`)**:

```bash
npm run dev
```

### What happens when you run this?
- **Backend**: Launches the Flask/WebSocket development server on `http://localhost:5000`.
- **Frontend**: Launches the Vite development server on `http://localhost:5173`.
- The terminal will display logs for both simultaneously.

### Accessing the App
Open your browser and navigate to: **http://localhost:5173**

1. Create a new account.
2. Complete the onboarding questionnaire.
3. Upload your Resume to the Global Vault on the Dashboard.
4. Try out an AI Mock Interview or analyze your Resume ATS score!

---

## 🏆 THE IMPACT
**PrepAI** isn't just a tool; it's a career accelerator. By bridging the gap between high-pressure behavioral analysis and technical accuracy, we provide candidates with the same tools used by elite hiring firms. 

**Prepare for the best. Be the better.**

---

<div align="center">
  <p>Engineered for Excellence by <b>Prathmesh Nitnaware</b></p>
  <a href="https://github.com/prathmesh-nitnaware">
    <img src="https://img.shields.io/badge/Connect-GitHub-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/System-Stable-green?style=for-the-badge" alt="Stable">
</div>
