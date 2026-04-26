// src/pages/ProjectCreate.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { projectsAPI } from '../api/services';
import PageLayout from '../components/layout/PageLayout';
import { Button, Input, Textarea, Card } from '../components/ui';

const TECH_OPTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'React', 'Vue', 'Angular', 'Node.js',
  'Django', 'Flask', 'Spring', 'Laravel', 'Express',
];

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', githubUrl: '', techStack: [], tags: [],
  });
  const [sourceCode, setSourceCode] = useState('');
  const [files,      setFiles]      = useState([]);
  const [techInput,  setTechInput]  = useState('');
  const [errors,     setErrors]     = useState({});
  const [activeTab,  setActiveTab]  = useState('paste'); // 'paste' | 'upload'

  // ── Dropzone ────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md'],
      'application/javascript': ['.js', '.jsx', '.ts', '.tsx'],
      'text/x-python': ['.py'],
      'text/x-java-source': ['.java'],
      'text/x-csrc': ['.c', '.cpp', '.h'],
      'text/x-csharp': ['.cs'],
      'application/x-ruby': ['.rb'],
      'text/x-go': ['.go'],
      'application/json': ['.json'],
      'text/html': ['.html'],
      'text/css': ['.css'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  // ── Tech stack ───────────────────────────────────────────────────
  const toggleTech = (tech) => {
    setForm(f => ({
      ...f,
      techStack: f.techStack.includes(tech)
        ? f.techStack.filter(t => t !== tech)
        : [...f.techStack, tech],
    }));
  };

  const addCustomTech = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!form.techStack.includes(techInput.trim())) {
        setForm(f => ({ ...f, techStack: [...f.techStack, techInput.trim()] }));
      }
      setTechInput('');
    }
  };

  // ── Validate ─────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())                         e.title = 'Title is required';
    if (!sourceCode.trim() && files.length === 0)   e.code  = 'Please paste code or upload files';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('githubUrl',   form.githubUrl);
      fd.append('sourceCode',  sourceCode);
      fd.append('techStack',   JSON.stringify(form.techStack));
      fd.append('tags',        JSON.stringify(form.tags));
      for (const f of files) fd.append('files', f);

      const res = await projectsAPI.create(fd);
      toast.success('Project created successfully!');
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (idx) => setFiles(f => f.filter((_, i) => i !== idx));

  return (
    <PageLayout>
      <div className="py-8 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-ds-muted hover:text-ds-text mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-display font-bold text-ds-text">New Project</h1>
          <p className="text-ds-muted text-sm mt-1">Add your code to get AI analysis, UML diagrams, and an IEEE SRS document</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-6">

          {/* Basic info */}
          <Card className="p-6 space-y-5">
            <h2 className="text-base font-display font-semibold text-ds-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-ds-accent/20 text-ds-accent text-xs flex items-center justify-center font-bold">1</span>
              Project Details
            </h2>
            <Input label="Project Title *" placeholder="e.g. E-commerce Platform Backend"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              error={errors.title}/>
            <Textarea label="Description" placeholder="What does this project do? What are the main features?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}/>
            <Input label="GitHub / Project URL (optional)" placeholder="https://github.com/user/repo"
              value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })}/>
          </Card>

          {/* Tech stack */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-display font-semibold text-ds-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-ds-cyan/20 text-ds-cyan text-xs flex items-center justify-center font-bold">2</span>
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {TECH_OPTIONS.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    form.techStack.includes(tech)
                      ? 'bg-ds-accent/20 border-ds-accent/50 text-ds-accent'
                      : 'bg-transparent border-ds-border text-ds-muted hover:border-ds-faint hover:text-ds-text'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add custom technology (press Enter)"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={addCustomTech}
              className="w-full px-4 py-2.5 bg-ds-bg border border-ds-border rounded-lg text-ds-text placeholder-ds-faint text-sm focus:outline-none focus:ring-2 focus:ring-ds-accent/50 transition-all"
            />
          </Card>

          {/* Source code */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-display font-semibold text-ds-text flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-ds-pink/20 text-ds-pink text-xs flex items-center justify-center font-bold">3</span>
              Source Code *
            </h2>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-ds-bg border border-ds-border rounded-lg p-1 w-fit">
              {[{ id: 'paste', label: 'Paste Code' }, { id: 'upload', label: 'Upload Files' }].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === t.id ? 'bg-ds-accent text-white' : 'text-ds-muted hover:text-ds-text'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'paste' ? (
              <div>
                <textarea
                  value={sourceCode}
                  onChange={e => setSourceCode(e.target.value)}
                  placeholder="// Paste your source code here..."
                  rows={16}
                  className="w-full px-4 py-3 bg-ds-bg border border-ds-border rounded-lg text-ds-text placeholder-ds-faint text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ds-accent/50 transition-all resize-y"
                />
                {sourceCode && (
                  <p className="text-xs text-ds-muted mt-1.5">
                    {sourceCode.split('\n').length} lines · {sourceCode.length.toLocaleString()} chars
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-ds-accent bg-ds-accent/5'
                      : 'border-ds-border hover:border-ds-accent/40 hover:bg-white/2'
                  }`}
                >
                  <input {...getInputProps()} />
                  <svg className="w-10 h-10 text-ds-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <p className="text-sm text-ds-muted">
                    {isDragActive ? 'Drop files here…' : 'Drag & drop code files, or click to browse'}
                  </p>
                  <p className="text-xs text-ds-faint mt-1">.js .ts .py .java .cpp .go .rb .php and more · Max 10 MB</p>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-ds-bg border border-ds-border rounded-lg">
                        <svg className="w-4 h-4 text-ds-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span className="text-sm text-ds-text flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-ds-muted flex-shrink-0">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button onClick={() => removeFile(i)} className="text-ds-muted hover:text-ds-red transition-colors flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.code && <p className="text-xs text-ds-red">{errors.code}</p>}
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={handleSubmit} loading={loading} size="lg" icon={
              !loading && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
              )
            }>
              Create Project
            </Button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
