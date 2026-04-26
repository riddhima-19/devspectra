// src/api/services.js
import api from './axios';

export const authAPI = {
  login:          data  => api.post('/auth/login', data),
  register:       data  => api.post('/auth/register', data),
  getMe:          ()    => api.get('/auth/me'),
  updateProfile:  data  => api.put('/auth/profile', data),
  updatePassword: data  => api.put('/auth/password', data),
};

export const projectsAPI = {
  list:   params => api.get('/projects', { params }),
  get:    id     => api.get(`/projects/${id}`),
  create: data   => api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: id     => api.delete(`/projects/${id}`),
};

export const analysisAPI = {
  run:          projectId => api.post(`/analysis/run/${projectId}`),
  getByProject: projectId => api.get(`/analysis/project/${projectId}`),
  getById:      id        => api.get(`/analysis/${id}`),
  pollStatus:   id        => api.get(`/analysis/status/${id}`),
  listAll:      ()        => api.get('/analysis'),
};

export const srsAPI = {
  generate:    data => api.post('/srs/generate', data),
  projectPlan: data => api.post('/srs/project-plan', data),
};

export const exportAPI = {
  downloadSrsPdf:     id => api.get(`/export/srs-pdf/${id}`,      { responseType: 'blob' }),
  downloadSrsMd:      id => api.get(`/export/srs-md/${id}`,       { responseType: 'blob' }),
  downloadReportJson: id => api.get(`/export/report-json/${id}`,  { responseType: 'blob' }),
};

export function triggerDownload(blob, filename) {
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
