// src/utils/constants.js — Application-wide constants

// ── API ───────────────────────────────────────────────────────────
export const API_BASE = process.env.REACT_APP_API_URL || '/api';
export const API_TIMEOUT_MS = 120_000; // 2 min for AI calls

// ── Analysis polling ──────────────────────────────────────────────
export const POLL_INTERVAL_MS    = 5_000;
export const POLL_MAX_ATTEMPTS   = 72;   // 6 min max (72 × 5s)
export const ANALYSIS_TIMEOUT_MS = 360_000;

// ── File upload ───────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB    = 10;
export const MAX_FILES_PER_PROJECT = 20;
export const ALLOWED_EXTENSIONS  = [
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.cpp', '.c', '.cs',
  '.go', '.rb', '.php', '.swift', '.kt', '.rs',
  '.html', '.css', '.json', '.xml',
  '.yaml', '.yml', '.sql', '.sh', '.md', '.txt',
];

// ── Tech stack presets ────────────────────────────────────────────
export const TECH_STACK_OPTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Vue', 'Angular', 'Next.js', 'Svelte',
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'Laravel', 'Rails',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'GraphQL', 'REST', 'gRPC',
];

// ── Project status ────────────────────────────────────────────────
export const PROJECT_STATUS = {
  DRAFT:     'draft',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED:    'failed',
};

export const PROJECT_STATUS_LABELS = {
  draft:     'Draft',
  analyzing: 'Analysing',
  completed: 'Complete',
  failed:    'Failed',
};

// ── Analysis tabs ─────────────────────────────────────────────────
export const ANALYSIS_TABS = [
  { id: 'overview',      label: 'Overview',        icon: '📊' },
  { id: 'metrics',       label: 'Metrics',          icon: '📐' },
  { id: 'quality',       label: 'Code Quality',     icon: '🔍' },
  { id: 'construction',  label: 'Construction',     icon: '🏗️' },
  { id: 'uml',           label: 'UML Diagrams',     icon: '📌' },
  { id: 'srs',           label: 'SRS Document',     icon: '📄' },
];

// ── UML diagram types ─────────────────────────────────────────────
export const UML_DIAGRAM_TYPES = [
  { type: 'useCaseDiagram',      label: 'Use Case Diagram'      },
  { type: 'classDiagram',        label: 'Class Diagram'         },
  { type: 'sequenceDiagram',     label: 'Sequence Diagram'      },
  { type: 'activityDiagram',     label: 'Activity Diagram'      },
  { type: 'stateDiagram',        label: 'State Diagram'         },
  { type: 'collaborationDiagram',label: 'Collaboration Diagram' },
  { type: 'deploymentDiagram',   label: 'Deployment Diagram'    },
  { type: 'componentDiagram',    label: 'Component Diagram'     },
  { type: 'packageDiagram',      label: 'Package Diagram'       },
];

// ── Severity levels ───────────────────────────────────────────────
export const SEVERITY_LEVELS  = ['critical', 'high', 'medium', 'low', 'info'];
export const SEVERITY_WEIGHTS = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };

// ── Pagination ────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12;

// ── Local storage keys ────────────────────────────────────────────
export const LS_KEYS = {
  AUTH:      'devspectra-auth',
  THEME:     'devspectra-theme',
  LAST_TAB:  'devspectra-last-tab',
};

// ── External links ────────────────────────────────────────────────
export const LINKS = {
  GEMINI_STUDIO: 'https://aistudio.google.com/',
  MONGODB_ATLAS: 'https://cloud.mongodb.com/',
  DOCS:          'https://github.com/devspectra/devspectra#readme',
};
