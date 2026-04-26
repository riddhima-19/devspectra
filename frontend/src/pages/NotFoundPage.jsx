// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ds-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Glitch number */}
        <div className="relative mb-6">
          <p className="text-[120px] font-display font-bold leading-none gradient-text select-none">
            404
          </p>
          <p className="absolute inset-0 text-[120px] font-display font-bold leading-none text-ds-pink/10 translate-x-1 translate-y-1 select-none">
            404
          </p>
        </div>

        <h1 className="text-2xl font-display font-bold text-ds-text mb-3">
          Page not found
        </h1>
        <p className="text-ds-muted text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-ds-accent hover:bg-ds-accentHover text-white text-sm font-medium rounded-xl transition-all shadow-glow-sm"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-ds-text text-sm font-medium rounded-xl border border-ds-border transition-all"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
