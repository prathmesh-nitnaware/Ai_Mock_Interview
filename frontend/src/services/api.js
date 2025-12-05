import axios from 'axios';

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// --- Auth & User API ---
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed.');
    }
  },

  signup: async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Signup failed.');
    }
  },

  // Fetch real analytics from MongoDB
  getUserStats: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user_stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Return zero states on error so UI doesn't crash
      return { count: 0, latestScore: 0, averageScore: 0, history: [] };
    }
  },

  // Book a consultation session
  bookConsultation: async (userId, topic) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('topic', topic);
    
    const response = await axios.post(`${API_URL}/book_consultation`, formData);
    return response.data;
  }
};

// --- Resume API ---
export const resumeAPI = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', "Software Engineer"); // Default context

    try {
      const response = await axios.post(`${API_URL}/score_resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const resumeInfo = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date(),
        analysis: response.data
      };
      
      // We still cache the CURRENT active resume in localStorage for quick access
      localStorage.setItem('current_resume', JSON.stringify(resumeInfo));
      
      return { resume: resumeInfo, message: "Resume analyzed successfully!" };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to analyze resume. Is the backend running?");
    }
  },

  getResume: async () => {
    const data = localStorage.getItem('current_resume');
    return { resume: data ? JSON.parse(data) : null };
  },
  
  deleteResume: async () => {
    localStorage.removeItem('current_resume');
  }
};

// --- Interview API ---
export const interviewAPI = {
  startSession: async (file, difficulty = "Medium", numQuestions = 3) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('num_questions', numQuestions);

    const response = await axios.post(`${API_URL}/generate_interview_plan`, formData);
    return response.data; 
  },

  sendFrame: async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, "frame.jpg");
    // Short timeout prevents UI lag during video processing
    const response = await axios.post(`${API_URL}/analyze_frame`, formData, { timeout: 1000 }); 
    return response.data;
  },

  submitInterview: async (turnData, audioBlobs, cvScores, userId) => {
    const formData = new FormData();
    formData.append('turn_data_json', JSON.stringify(turnData));
    
    // Vital: Associate this interview with the logged-in user
    formData.append('user_id', userId);

    audioBlobs.forEach((blob, index) => {
      formData.append('files', blob, `audio_${index}.wav`);
    });

    cvScores.forEach((scores, index) => {
      const scoresBlob = new Blob([JSON.stringify(scores)], { type: 'application/json' });
      formData.append('files', scoresBlob, `cv_scores_${index}.json`);
    });

    const response = await axios.post(`${API_URL}/submit_full_interview`, formData);
    return response.data;
  }
};