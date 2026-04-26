// src/components/layout/PageLayout.jsx
import React from 'react';
import Navbar from './Navbar';

export default function PageLayout({ children, fullWidth = false }) {
  return (
    <div className="min-h-screen bg-ds-bg">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-40 pointer-events-none" />

      <Navbar />

      <main className={`pt-16 relative ${fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        {children}
      </main>
    </div>
  );
}
