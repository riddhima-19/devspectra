// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const NAV = [
  { to: '/dashboard',        label: 'Dashboard',       icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { to: '/projects',         label: 'My Projects',     icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/>
      <path d="M7 21H5a2 2 0 01-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  )},
  { to: '/projects/new',     label: 'Create Project',  icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
    </svg>
  )},
  { to: '/code-analysis',    label: 'Code Analysis',   icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10 20l4-16M6 9l-4 4 4 4M18 9l4 4-4 4"/>
    </svg>
  )},
  { to: '/generate-srs',     label: 'Generate SRS',    icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )},
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <aside className="sidebar" style={{
      width: 240, minHeight: '100vh', background: '#111118',
      borderRight: '1px solid #252535', display: 'flex',
      flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #252535' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 20l4-16M6 9l-4 4 4 4M18 9l4 4-4 4"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#e2e2f0' }}>CodeAnalyzer</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span style={{ flexShrink: 0 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #252535' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e2f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: '#8888a4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
