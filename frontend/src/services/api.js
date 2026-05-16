import axios from "axios";

/**
 * BASE URL SWITCHER
 * Swaps between local development and production Render deployment.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


/**
 * AXIOS CLIENT CONFIGURATION
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * AUTH INTERCEPTOR
 * Automatically attaches the JWT Bearer token to every request if it exists.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Handles automatic logout if the backend returns a 401 Unauthorized (token expired).
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(
      error.response?.data || { message: "Server error" }
    );
  }
);

// ==========================================
// API ACTIONS
// ==========================================

export const api = {
  /**
   * AUTHENTICATION
   */
  loginUser: async (credentials) => {
    const res = await apiClient.post("/api/auth/login", credentials);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  },

  registerUser: async (userData) => {
    const res = await apiClient.post("/api/auth/signup", userData);
    return res.data;
  },

  /**
   * RESUME VAULT (Persistent MongoDB Storage)
   * Stores the resume once for use across all AI modules.
   */
  uploadProfileResume: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await apiClient.post("/api/profile/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * INTERVIEW RESUME UPLOAD 
   * (Alias for scoreResume used in the setup screen)
   */
  uploadResumeForInterview: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await apiClient.post("/api/resume/score", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * RESUME SCORING (ATS Optimizer)
   */
  scoreResume: async (formData) => {
    const res = await apiClient.post("/api/resume/score", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * CODING DOJO (HackerRank logic)
   * Fetches curated challenges from the coding routes.
   */
  getChallenges: async () => {
    const res = await apiClient.get("/api/coding/challenges");
    return res.data;
  },

  getSingleChallenge: async (id) => {
    const res = await apiClient.get(`/api/coding/challenge/${id}`);
    return res.data;
  },

  /**
   * MOCK INTERVIEW SESSIONS
   */
  initiateInterview: async (payload) => {
    const res = await apiClient.post("/api/interview/initiate", payload);
    return res.data;
  },

  submitCode: async (payload) => {
    // Allows submission context for both Live Interviews and Coding Dojo
    const res = await apiClient.post("/api/interview/submit", payload);
    return res.data;
  },

  /**
   * ANALYTICS & DASHBOARD
   */
  getDashboard: async () => {
    const res = await apiClient.get("/api/dashboard/");
    return res.data;
  },

  client: apiClient 
};