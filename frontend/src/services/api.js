// src/services/api.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

// ==========================
// AXIOS INSTANCE
// ==========================
const instance = axios.create({
  baseURL: API_BASE,
  timeout: 20000, // slightly increased
});

// ==========================
// REQUEST INTERCEPTOR (JWT)
// ==========================
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// RESPONSE INTERCEPTOR (AUTO LOGOUT)
// ==========================
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Auto logout if token expired / unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ==========================
// EXPORT INSTANCE
// ==========================
export const API = axios.create({
  baseURL: "http://localhost:5000", // ✅ IMPORTANT
});
export default instance;

// ==========================
// 🔐 AUTH APIs
// ==========================

export async function postLogin(credentials) {
  return instance.post("/auth/login", credentials);
}

export async function postRegister(data) {
  return instance.post("/auth/register", data);
}

// ✅ NEW: Get current user profile
export async function fetchCurrentUser() {
  return instance.get("/auth/me");
}

// ==========================
// 📁 FILE / REPORT APIs
// ==========================

export async function uploadFile(formData) {
  return instance.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0, // allow large uploads
  });
}

export async function fetchHistory(userId) {
  return instance.get(`/files/history/${userId}`);
}

export async function fetchSummary(userId) {
  return instance.get(`/files/summary/${userId}`);
}

export async function extractKpis(payload) {
  return instance.post("/files/extract_kpi", payload, {
    timeout: 0,
  });
}

// ==========================
// 🤖 AI FINANCIAL ANALYSIS APIs
// ==========================

export async function analyzeFinancialReport() {
  return instance.get("/api/analyze");
}

export async function fetchInsights(userId) {
  return instance.get(`/api/insights/${userId}`);
}