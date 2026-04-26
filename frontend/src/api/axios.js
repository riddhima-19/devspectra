// src/api/axios.js — Configured Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 120000, // 2 min for AI analysis calls
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach stored token ────────────────────
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('devspectra-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (_) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('devspectra-auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
