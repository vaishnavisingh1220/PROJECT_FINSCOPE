// src/services/api.js

import axios from "axios";

// ==========================
// BASE URL
// ==========================
const API_BASE = "http://127.0.0.1:5000";

// ==========================
// SINGLE AXIOS INSTANCE
// ==========================
export const API = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// ==========================
// REQUEST INTERCEPTOR
// ==========================
API.interceptors.request.use(
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
// RESPONSE INTERCEPTOR
// ==========================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;

// ==========================
// AUTH APIs
// ==========================

export async function postLogin(credentials) {
  return API.post("/auth/login", credentials);
}

export async function postRegister(data) {
  return API.post("/auth/register", data);
}

export async function fetchCurrentUser() {
  return API.get("/auth/me");
}

// ==========================
// FILE APIs
// ==========================

export async function uploadFile(formData) {
  return API.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 0,
  });
}

export async function fetchHistory(userId) {
  return API.get(`/files/history/${userId}`);
}

export async function fetchSummary(userId) {
  return API.get(`/files/summary/${userId}`);
}

export async function extractKpis(payload) {
  return API.post("/files/extract_kpi", payload, {
    timeout: 0,
  });
}

// ==========================
// AI APIs
// ==========================

export async function analyzeFinancialReport() {
  return API.get("/api/analyze");
}

export async function fetchInsights(userId) {
  return API.get(`/api/insights/${userId}`);
}