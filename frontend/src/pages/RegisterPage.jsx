// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Input, Button } from '../components/ui';

export default function RegisterPage() {
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name)                          e.name     = 'Name is required';
    if (!form.email)                         e.email    = 'Email is required';
    if (form.password.length < 8)            e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm)      e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome to DevSpectra.');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-ds-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-ds-pink/4 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
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
          <h1 className="text-2xl font-display font-bold text-ds-text">Create your account</h1>
          <p className="text-ds-muted text-sm mt-1">Start analysing your code with AI</p>
        </div>

        <div className="bg-ds-card border border-ds-border rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" type="text" placeholder="Jane Smith"
              value={form.name} onChange={update('name')} error={errors.name} autoComplete="name"/>
            <Input label="Email address" type="email" placeholder="you@example.com"
              value={form.email} onChange={update('email')} error={errors.email} autoComplete="email"/>
            <Input label="Password" type="password" placeholder="Min 8 characters"
              value={form.password} onChange={update('password')} error={errors.password} autoComplete="new-password"/>
            <Input label="Confirm password" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={update('confirm')} error={errors.confirm} autoComplete="new-password"/>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-ds-border text-center">
            <p className="text-sm text-ds-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-ds-accent hover:text-ds-accentHover font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
