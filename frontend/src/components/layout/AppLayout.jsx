// src/components/layout/AppLayout.jsx — Main app layout with sidebar
import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children, title }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d14' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top header */}
        <header style={{
          height: 60, background: '#111118', borderBottom: '1px solid #252535',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#e2e2f0', margin: 0 }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8888a4', padding: 6 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}>U</div>
          </div>
        </header>
        {/* Page content */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
