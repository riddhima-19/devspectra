// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import Dashboard      from './pages/Dashboard';
import ProjectCreate  from './pages/ProjectCreate';
import ProjectDetail  from './pages/ProjectDetail';
import AnalysisView   from './pages/AnalysisView';
import ProfilePage    from './pages/ProfilePage';
import CodeAnalysis   from './pages/CodeAnalysis';
import GenerateSRS    from './pages/GenerateSRS';
import NotFoundPage   from './pages/NotFoundPage';

function Protected({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}
function Public({ children }) {
  const token = useAuthStore(s => s.token);
  return !token ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const restoreToken = useAuthStore(s => s.restoreToken);
  useEffect(() => { restoreToken(); }, [restoreToken]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#16161f', color: '#e2e2f0', border: '1px solid #252535', borderRadius: 10, fontSize: 14 },
        success: { iconTheme: { primary: '#4ade80', secondary: '#16161f' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#16161f' } },
      }} />
      <Routes>
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Public><LoginPage /></Public>} />
        <Route path="/register"        element={<Public><RegisterPage /></Public>} />
        <Route path="/dashboard"       element={<Protected><Dashboard /></Protected>} />
        <Route path="/projects"        element={<Protected><Dashboard /></Protected>} />
        <Route path="/projects/new"    element={<Protected><ProjectCreate /></Protected>} />
        <Route path="/projects/:id"    element={<Protected><ProjectDetail /></Protected>} />
        <Route path="/projects/:id/analysis" element={<Protected><AnalysisView /></Protected>} />
        <Route path="/code-analysis"   element={<Protected><CodeAnalysis /></Protected>} />
        <Route path="/generate-srs"    element={<Protected><GenerateSRS /></Protected>} />
        <Route path="/profile"         element={<Protected><ProfilePage /></Protected>} />
        <Route path="*"                element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
