// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Input, Button } from '../components/ui';

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-ds-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-ds-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ds-accent to-ds-cyan flex items-center justify-center shadow-glow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-2xl gradient-text">DevSpectra</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-ds-text">Welcome back</h1>
          <p className="text-ds-muted text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {/* Form card */}
        <div className="bg-ds-card border border-ds-border rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-ds-border text-center">
            <p className="text-sm text-ds-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-ds-accent hover:text-ds-accentHover font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-ds-faint mt-6">
          AI-powered code analysis &amp; SRS generation
        </p>
      </motion.div>
    </div>
  );
}
