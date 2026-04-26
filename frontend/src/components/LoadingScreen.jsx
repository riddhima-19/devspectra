// src/components/LoadingScreen.jsx — Full-page loading state
import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 bg-ds-bg flex flex-col items-center justify-center z-50">
      {/* Animated logo mark */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-ds-accent to-ds-cyan
          flex items-center justify-center mb-6 shadow-glow-sm"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-ds-muted"
      >
        {message}
      </motion.p>

      {/* Dot loader */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ds-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
