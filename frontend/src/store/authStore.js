// src/store/authStore.js — Zustand global auth state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,
      error:   null,

      // ── Login ──────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, user } = res.data;
          // Attach token to axios defaults
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.error || 'Login failed';
          set({ error: msg, loading: false });
          return { success: false, error: msg };
        }
      },

      // ── Register ───────────────────────────────────────────────────
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          const { token, user } = res.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.error
            || err.response?.data?.errors?.[0]?.msg
            || 'Registration failed';
          set({ error: msg, loading: false });
          return { success: false, error: msg };
        }
      },

      // ── Logout ─────────────────────────────────────────────────────
      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, error: null });
      },

      // ── Update profile ─────────────────────────────────────────────
      updateProfile: async (data) => {
        try {
          const res = await api.put('/auth/profile', data);
          set({ user: res.data.user });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.response?.data?.error };
        }
      },

      // ── Restore token to axios on app load ──────────────────────────
      restoreToken: () => {
        const { token } = get();
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'devspectra-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
