// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard',    label: 'Dashboard' },
    { to: '/projects/new', label: 'New Project' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ds-border bg-ds-surface/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ds-accent to-ds-cyan flex items-center justify-center shadow-glow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight gradient-text">
              DevSpectra
            </span>
          </Link>

          {/* Nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === to
                      ? 'bg-ds-accent/20 text-ds-accent'
                      : 'text-ds-muted hover:text-ds-text hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ds-accent to-ds-pink flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-ds-text font-medium max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <svg className={`w-4 h-4 text-ds-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-ds-card border border-ds-border rounded-xl shadow-card overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-ds-border">
                        <p className="text-sm font-medium text-ds-text truncate">{user.name}</p>
                        <p className="text-xs text-ds-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ds-muted hover:text-ds-text hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          Profile Settings
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ds-muted hover:text-ds-text hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                          </svg>
                          Dashboard
                        </Link>
                      </div>
                      <div className="py-1 border-t border-ds-border">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ds-red hover:bg-ds-red/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 text-sm text-ds-muted hover:text-ds-text transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="px-4 py-2 bg-ds-accent hover:bg-ds-accentHover text-white text-sm font-medium rounded-lg transition-all shadow-glow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
