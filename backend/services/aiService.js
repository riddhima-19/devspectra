// services/aiService.js
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const OpenAI = require("openai");

let openaiClient = null;

function initAI() {
  if (process.env.OPENAI_API_KEY && !openaiClient) {
    try {
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } catch (e) {
      console.error("OpenAI init error:", e.message);
    }
  }
}

// ── MERMAID CLEANER / FIXER ───────────────────────────────────────
function fixMermaidSyntax(text = "") {
  let clean = String(text).trim();

  // Remove markdown fences
  clean = clean.replace(/^```mermaid\s*/i, "");
  clean = clean.replace(/^```\s*/i, "");
  clean = clean.replace(/\s*```$/i, "");
  clean = clean.trim();

  // Remove labels like "Mermaid:" or "Diagram:"
  clean = clean.replace(/^(mermaid|diagram)\s*:\s*/i, "");

  // Fix: "graph TD[Auth Module]" -> "graph TD\nA[Auth Module]"
  clean = clean.replace(/^(graph\s+(TD|LR|TB|BT|RL))\s*\[/i, "$1\nA[");

  // Fix: "flowchart TD[Start]" -> "flowchart TD\nA[Start]"
  clean = clean.replace(/^(flowchart\s+(TD|LR|TB|BT|RL))\s*\[/i, "$1\nA[");

  // Fix lines that start with [Label] by adding node IDs
  let nodeCounter = 1;
  clean = clean.replace(/(^|\n)\s*\[([^\]]+)\]/g, (_match, prefix, label) => {
    const id = `N${nodeCounter++}`;
    return `${prefix}${id}[${label}]`;
  });

  // Fix arrows pointing to [Label] without ID: --> [API] -> --> N2[API]
  clean = clean.replace(/(-->|---|-.->|==>)\s*\[([^\]]+)\]/g, (_match, arrow, label) => {
    const id = `N${nodeCounter++}`;
    return `${arrow} ${id}[${label}]`;
  });

  // Fix arrows from [Label] without ID: [Auth] --> -> N3[Auth] -->
  clean = clean.replace(/\[([^\]]+)\]\s*(-->|---|-.->|==>)/g, (_match, label, arrow) => {
    const id = `N${nodeCounter++}`;
    return `${id}[${label}] ${arrow}`;
  });

  return clean.trim();
}

function normalizeUmlDiagrams(diagrams = []) {
  if (!Array.isArray(diagrams)) return [];

  return diagrams.map((d, index) => ({
    type: String(d?.type || `diagram${index + 1}`),
    title: String(d?.title || `Diagram ${index + 1}`),
    mermaid: fixMermaidSyntax(d?.mermaid || ""),
  }));
}

// ── AI CALL ───────────────────────────────────────────────────────
async function callAI(prompt, systemContext = "") {
  initAI();

  const fullPrompt = systemContext
    ? `${systemContext}\n\n${prompt}`
    : prompt;

  if (process.env.GEMINI_API_KEY) {
    const gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    const maxRetries = 3;
    let delay = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: fullPrompt,
        });

        return response.text;
      } catch (err) {
        const msg = err?.message || "";

        console.error(`Gemini attempt ${attempt} failed:`, msg);

        const isRetryable =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("overloaded");

        if (!isRetryable || attempt === maxRetries) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  if (openaiClient) {
    const messages = [];

    if (systemContext) {
      messages.push({
        role: "system",
        content: systemContext,
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 4096,
    });

    return completion.choices[0].message.content;
  }

  throw new Error(
    "No AI API key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to your .env file."
  );
}

// ── JSON PARSER ───────────────────────────────────────────────────
function parseJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("AI returned empty or invalid text.");
  }

  let clean = text.trim();

  clean = clean.replace(/^```json\s*/i, "");
  clean = clean.replace(/^```\s*/i, "");
  clean = clean.replace(/\s*```\s*$/i, "");
  clean = clean.trim();

  const firstBrace = clean.indexOf("{");
  const firstBracket = clean.indexOf("[");

  if (firstBrace === -1 && firstBracket === -1) {
    console.error("AI raw response:", clean);
    throw new Error("No JSON found in AI response");
  }

  let startIdx;
  let endChar;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endChar = "}";
  } else {
    startIdx = firstBracket;
    endChar = "]";
  }

  const lastIdx = clean.lastIndexOf(endChar);

  if (lastIdx === -1) {
    console.error("AI raw response:", clean);
    throw new Error("Malformed JSON in AI response");
  }

  const jsonStr = clean.slice(startIdx, lastIdx + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("JSON parse failed. Extracted JSON:", jsonStr);
    throw err;
  }
}

// ── 1. CODE METRICS ───────────────────────────────────────────────
async function analyseMetrics(code, language) {
  const systemCtx = `You are a software metrics expert.
CRITICAL: Return ONLY a valid JSON object. No markdown, no code fences, no explanation.
Every field in the JSON must use actual numbers, not strings.`;

  const prompt = `Analyse this ${language || "code"} and return a JSON object with this exact structure:
{
  "language": "JavaScript",
  "frameworks": ["Express", "Mongoose"],
  "summary": "Brief description of what this code does in 2-3 sentences.",
  "metrics": {
    "loc": 150,
    "sloc": 120,
    "blankLines": 20,
    "commentLines": 10,
    "commentRatio": 6.7,
    "functionCount": 8,
    "avgFunctionLength": 15.0,
    "halstead": {
      "vocabulary": 45,
      "length": 180,
      "volume": 1050.5,
      "difficulty": 14.2,
      "effort": 14916.0,
      "timeToProgram": 829.8,
      "bugs": 0.35
    },
    "cyclomaticComplexity": {
      "average": 2.5,
      "max": 8,
      "perFunction": [
        {
          "name": "createUser",
          "complexity": 4
        },
        {
          "name": "login",
          "complexity": 8
        }
      ]
    },
    "informationFlow": {
      "fanIn": 3,
      "fanOut": 5,
      "ifMetric": 2250.0
    },
    "oo": {
      "classCount": 2,
      "avgMethodsPerClass": 4.0,
      "depthOfInheritanceTree": 1,
      "couplingBetweenClasses": 3,
      "lackOfCohesionInMethods": 0.25,
      "weightedMethodsPerClass": 12.0,
      "responsesForClass": 15.0
    }
  },
  "codeQuality": {
    "score": 72,
    "maintainability": 75,
    "readability": 70,
    "testability": 65
  }
}

Replace all values with your actual analysis. Keep the exact field names.

CODE TO ANALYSE:
${code.substring(0, 4000)}`;

  const raw = await callAI(prompt, systemCtx);
  return parseJSON(raw);
}

// ── 2. CODE QUALITY ───────────────────────────────────────────────
async function analyseCodeQuality(code, language) {
  const systemCtx = `You are a senior code reviewer and security expert.
CRITICAL RULES:
1. Return ONLY a valid JSON object. No markdown fences. No JavaScript code. No eval().
2. The "code" field in testCases must be a plain string, not JavaScript code with concatenation.
3. All arrays must contain JSON objects, not JavaScript expressions.
4. Do NOT use string concatenation (+ operator) anywhere in JSON values.`;

  const prompt = `Analyse this ${language || "code"} for quality issues.
Return a JSON object with exactly these fields:
{
  "codeSmells": [
    {
      "type": "Long Method",
      "severity": "medium",
      "title": "Handler function is too long",
      "description": "The createUser function exceeds 40 lines making it hard to understand.",
      "line": 15,
      "suggestion": "Extract validation logic into a separate validateUser function."
    }
  ],
  "optimizations": [
    {
      "type": "Performance",
      "severity": "low",
      "title": "Inefficient database query",
      "description": "Multiple separate queries could be combined into one.",
      "line": 42,
      "suggestion": "Use a single aggregation pipeline instead of multiple find calls."
    }
  ],
  "refactoring": [
    {
      "type": "Extract Method",
      "severity": "low",
      "title": "Repeated validation logic",
      "description": "Email validation is duplicated in three places.",
      "line": 10,
      "suggestion": "Create a shared validateEmail utility function."
    }
  ],
  "securityIssues": [
    {
      "type": "Input Validation",
      "severity": "high",
      "title": "Missing input sanitisation",
      "description": "User input is not sanitised before use.",
      "line": 25,
      "suggestion": "Use express-validator to sanitise all incoming request fields."
    }
  ],
  "designPatterns": [
    {
      "pattern": "Repository",
      "confidence": 0.8,
      "location": "UserController"
    }
  ],
  "testCases": [
    {
      "description": "Should return 400 when email is missing",
      "type": "unit",
      "code": "test('missing email', async () => { const res = await request(app).post('/register').send({password: '123'}); expect(res.status).toBe(400); });"
    },
    {
      "description": "Should return 401 for invalid credentials",
      "type": "integration",
      "code": "test('invalid login', async () => { const res = await request(app).post('/login').send({email: 'a@b.com', password: 'wrong'}); expect(res.status).toBe(401); });"
    }
  ]
}

IMPORTANT:
- "code" in testCases must be a single continuous string. No string concatenation.
- All severity values must be one of: critical, high, medium, low, info.
- Provide 3-5 items per array where applicable. Return empty arrays [] if none found.
- Replace example values with real analysis of the code below.

CODE:
${code.substring(0, 4000)}`;

  const raw = await callAI(prompt, systemCtx);
  return parseJSON(raw);
}

// ── 3. CONSTRUCTION ANALYSIS ──────────────────────────────────────
async function analyseConstruction(code, language) {
  const systemCtx = `You are a software construction expert.
CRITICAL: Return ONLY a valid JSON object. No markdown. No code fences. No explanations.`;

  const prompt = `Analyse this ${language || "code"} for construction quality.
Return exactly this JSON structure with real analysis:
{
  "codingStandards": [
    {
      "type": "NamingConvention",
      "severity": "low",
      "title": "Variable name not descriptive",
      "description": "Variable 'x' does not convey its purpose.",
      "line": 5,
      "suggestion": "Rename to something descriptive like 'userCount'."
    }
  ],
  "codeChecklist": [
    {
      "item": "Meaningful variable names used",
      "passed": true,
      "note": "Most names are clear"
    },
    {
      "item": "Functions have single responsibility",
      "passed": false,
      "note": "Some functions do multiple things"
    },
    {
      "item": "Error handling present",
      "passed": true,
      "note": "Try-catch blocks used"
    },
    {
      "item": "Input validation present",
      "passed": false,
      "note": "No validation on user input"
    },
    {
      "item": "No magic numbers",
      "passed": true,
      "note": "Constants are used"
    },
    {
      "item": "Consistent formatting",
      "passed": true,
      "note": "Code style is consistent"
    },
    {
      "item": "Appropriate comments",
      "passed": false,
      "note": "Missing JSDoc on exports"
    },
    {
      "item": "No dead code",
      "passed": true,
      "note": "No unreachable code found"
    }
  ],
  "reviewSuggestions": [
    "Add JSDoc comments to all exported functions",
    "Consider adding input validation middleware",
    "Extract magic strings into named constants"
  ],
  "refactoringTips": [
    "Split large functions into smaller, focused ones",
    "Move database queries to a dedicated repository layer",
    "Create a central error handling utility"
  ],
  "optimizationTips": [
    "Add database indexes to frequently queried fields",
    "Cache repeated lookups using a simple Map",
    "Use Promise.all for independent async operations"
  ]
}

Replace all values with your actual analysis of the code below.

CODE:
${code.substring(0, 4000)}`;

  const raw = await callAI(prompt, systemCtx);
  return parseJSON(raw);
}

// ── 4. UML DIAGRAMS ───────────────────────────────────────────────
async function generateUMLDiagrams(code, language, projectDescription) {
  const systemCtx = `You are a UML expert who writes Mermaid.js diagrams.
CRITICAL: Return ONLY a valid JSON object. No markdown fences. No explanations outside JSON.
All Mermaid code must use \\n for line breaks inside JSON strings.

STRICT MERMAID RULES:
- Return raw Mermaid syntax only inside each "mermaid" field.
- Never include markdown fences.
- Every graph or flowchart node must have an ID.
- Correct: A[Auth Module] --> B[API Module]
- Wrong: [Auth Module] --> [API Module]
- Correct graph start:
  graph TD
  A[Auth Module] --> B[API Module]
- Wrong graph start:
  graph TD[Auth Module] --> B[API Module]`;

  const prompt = `Generate 9 UML diagrams in Mermaid.js syntax for this ${language || "code"} project.
Project description: ${projectDescription || "Software project"}

Return exactly this JSON structure:
{
  "diagrams": [
    {
      "type": "useCaseDiagram",
      "title": "Use Case Diagram",
      "mermaid": "graph TD\\n  U[User] --> L[Login]\\n  U --> R[Register]\\n  A[Admin] --> M[Manage Users]"
    },
    {
      "type": "classDiagram",
      "title": "Class Diagram",
      "mermaid": "classDiagram\\n  class User {\\n    +String name\\n    +String email\\n    +login()\\n  }"
    },
    {
      "type": "sequenceDiagram",
      "title": "Sequence Diagram",
      "mermaid": "sequenceDiagram\\n  participant Client\\n  participant Server\\n  participant DB\\n  Client->>Server: Request\\n  Server->>DB: Query\\n  DB-->>Server: Result\\n  Server-->>Client: Response"
    },
    {
      "type": "activityDiagram",
      "title": "Activity Diagram",
      "mermaid": "flowchart TD\\n  S[Start] --> I[Receive Request]\\n  I --> V{Valid?}\\n  V -->|Yes| P[Process Request]\\n  V -->|No| E[Return Error]\\n  P --> R[Send Response]\\n  R --> END[End]"
    },
    {
      "type": "stateDiagram",
      "title": "State Diagram",
      "mermaid": "stateDiagram-v2\\n  [*] --> Idle\\n  Idle --> Processing\\n  Processing --> Success\\n  Processing --> Failed\\n  Success --> [*]\\n  Failed --> [*]"
    },
    {
      "type": "collaborationDiagram",
      "title": "Collaboration Diagram",
      "mermaid": "graph LR\\n  C[Client] --> API[API Layer]\\n  API --> S[Service Layer]\\n  S --> DB[(Database)]"
    },
    {
      "type": "deploymentDiagram",
      "title": "Deployment Diagram",
      "mermaid": "graph TB\\n  B[Browser] --> FE[Frontend Server]\\n  FE --> BE[Backend Server]\\n  BE --> DB[(MongoDB)]"
    },
    {
      "type": "componentDiagram",
      "title": "Component Diagram",
      "mermaid": "graph LR\\n  UI[React UI] --> API[REST API]\\n  API --> AUTH[Auth Module]\\n  API --> ANALYSIS[Analysis Module]\\n  ANALYSIS --> AI[Gemini AI Service]\\n  API --> DB[(MongoDB)]"
    },
    {
      "type": "packageDiagram",
      "title": "Package Diagram",
      "mermaid": "graph TD\\n  R[Routes] --> M[Models]\\n  R --> MW[Middleware]\\n  R --> S[Services]\\n  S --> U[Utils]"
    }
  ]
}

Make diagrams specific to the code. Keep Mermaid syntax simple and valid.

CODE:
${code.substring(0, 3000)}`;

  const raw = await callAI(prompt, systemCtx);
  const parsed = parseJSON(raw);

  const diagrams = parsed.diagrams || [];
  return normalizeUmlDiagrams(diagrams);
}

// ── 5. SRS FROM CODE ANALYSIS ─────────────────────────────────────
async function generateSRS(projectData, analysisData, umlDiagrams) {
  const systemCtx = `You are an IEEE 830 SRS expert. Write professional technical documentation in Markdown.`;

  const umlSection = (umlDiagrams || [])
    .map((d) => `\n### ${d.title}\n\`\`\`mermaid\n${d.mermaid}\n\`\`\``)
    .join("\n");

  const prompt = `Generate a complete IEEE 830-compliant SRS document in Markdown for this project.

PROJECT DETAILS:
- Name: ${projectData.title}
- Description: ${projectData.description || "Not provided"}
- Tech Stack: ${(projectData.techStack || []).join(", ")}
- Language: ${analysisData.language || "Not specified"}
- Frameworks: ${(analysisData.frameworks || []).join(", ")}
- Lines of Code: ${analysisData.metrics?.loc || "N/A"}
- Quality Score: ${analysisData.codeQuality?.score || "N/A"}/100
- Summary: ${analysisData.summary || ""}

Write the complete SRS with these sections:

# Software Requirements Specification — ${projectData.title}

## 1. Introduction
### 1.1 Purpose
### 1.2 Scope
### 1.3 Definitions and Acronyms
### 1.4 References
### 1.5 Document Overview

## 2. Overall Description
### 2.1 Product Perspective
### 2.2 Product Functions
### 2.3 User Classes and Characteristics
### 2.4 Operating Environment
### 2.5 Design Constraints
### 2.6 Assumptions and Dependencies

## 3. System Features
Write 3-5 feature sections. Each must include description, stimulus/response sequences, and numbered requirements.

## 4. External Interface Requirements
### 4.1 User Interfaces
### 4.2 Hardware Interfaces
### 4.3 Software Interfaces
### 4.4 Communication Interfaces

## 5. Non-Functional Requirements
### 5.1 Performance
### 5.2 Security
### 5.3 Reliability
### 5.4 Maintainability
### 5.5 Portability

## 6. Other Requirements

## Appendix A: UML Diagrams
${umlSection}

## Appendix B: Glossary

Be thorough. Minimum 1500 words.`;

  return callAI(prompt, systemCtx);
}

// ── 6. STANDALONE SRS ─────────────────────────────────────────────
async function generateStandaloneSRS(details) {
  const systemCtx = `You are an IEEE 830 SRS expert. Write professional SRS documents in Markdown format.`;

  const {
    name,
    purpose,
    scope,
    targetUsers,
    features,
    techStack,
    timeline,
  } = details;

  const prompt = `Generate a complete IEEE 830-compliant Software Requirements Specification in Markdown.

PROJECT:
- Name: ${name}
- Purpose: ${purpose}
- Scope: ${scope || "Not specified"}
- Target Users: ${targetUsers}
- Key Features: ${features}
- Tech Stack: ${techStack || "Not specified"}
- Timeline: ${timeline || "Not specified"}

Write the full SRS document:

# Software Requirements Specification — ${name}

### Document Control
| Field | Value |
|-------|-------|
| Document Title | SRS — ${name} |
| Version | 1.0 |
| Date | ${new Date().toLocaleDateString()} |
| Status | Draft |

## 1. Introduction
### 1.1 Purpose
### 1.2 Scope
### 1.3 Definitions, Acronyms, and Abbreviations
### 1.4 References
### 1.5 Document Overview

## 2. Overall Description
### 2.1 Product Perspective
### 2.2 Product Functions
### 2.3 User Classes and Characteristics
### 2.4 Operating Environment
### 2.5 Design and Implementation Constraints
### 2.6 Assumptions and Dependencies

## 3. System Features
Write 4-6 detailed feature sections based on the key features listed above.
For each feature include description, priority, stimulus/response sequences, and numbered requirements like REQ-3.1.1.

## 4. External Interface Requirements
### 4.1 User Interfaces
### 4.2 Hardware Interfaces
### 4.3 Software Interfaces
### 4.4 Communication Interfaces

## 5. Non-Functional Requirements
### 5.1 Performance Requirements
### 5.2 Safety Requirements
### 5.3 Security Requirements
### 5.4 Software Quality Attributes
### 5.5 Reliability Requirements
### 5.6 Maintainability
### 5.7 Portability

## 6. Other Requirements
### 6.1 Database Requirements
### 6.2 Legal and Regulatory Requirements

## Appendix A: Glossary
## Appendix B: Analysis Models

Write minimum 2000 words. Be specific to the project described above.`;

  return callAI(prompt, systemCtx);
}

// ── 7. PROJECT PLAN + GANTT CHART ────────────────────────────────
async function generateProjectPlan(details) {
  const systemCtx = `You are an expert project manager.
CRITICAL: Return ONLY a valid JSON object. No markdown fences. No explanations.
The ganttChart field must use \\n for line breaks and be valid Mermaid gantt syntax.`;

  const { name, purpose, features, timeline, teamSize } = details;
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Generate a project plan for this software project.
Return ONLY a JSON object with exactly this structure:
{
  "projectName": "${name}",
  "duration": "6 months",
  "phases": [
    {
      "name": "Requirements & Planning",
      "duration": "2 weeks",
      "tasks": [
        {
          "name": "Stakeholder interviews",
          "duration": "3 days",
          "dependency": null,
          "assignee": "Business Analyst"
        },
        {
          "name": "Requirements documentation",
          "duration": "4 days",
          "dependency": "Stakeholder interviews",
          "assignee": "Business Analyst"
        }
      ],
      "deliverables": ["SRS Document", "Project Plan"],
      "milestones": ["Requirements sign-off"]
    }
  ],
  "ganttChart": "gantt\\n  title ${name} Project Timeline\\n  dateFormat YYYY-MM-DD\\n  section Requirements\\n  Stakeholder interviews: ${today}, 3d",
  "risks": [
    {
      "risk": "Scope creep from changing requirements",
      "probability": "High",
      "impact": "High",
      "mitigation": "Strict change control process with client sign-off required"
    }
  ],
  "resources": [
    {
      "role": "Project Manager",
      "count": 1,
      "responsibilities": ["Project coordination", "Risk management"]
    }
  ],
  "estimatedCost": {
    "development": "$40,000",
    "testing": "$8,000",
    "deployment": "$2,000",
    "total": "$50,000"
  },
  "successCriteria": [
    "All functional requirements from SRS are implemented",
    "System handles expected load with response time under 2 seconds"
  ],
  "techStack": ["Node.js", "React", "MongoDB", "Docker"]
}

PROJECT TO PLAN:
- Name: ${name}
- Purpose: ${purpose}
- Features: ${features}
- Timeline: ${timeline || "6 months"}
- Team Size: ${teamSize || "3-5 developers"}

Replace ALL example values with a realistic plan for THIS specific project.
Use dates starting from ${today} for the ganttChart.
Make tasks specific to the features listed above.`;

  const raw = await callAI(prompt, systemCtx);
  return parseJSON(raw);
}

// ── 8. FULL ANALYSIS IN ONE CALL ──────────────────────────────────
async function generateFullAnalysis(
  code,
  language,
  projectDescription,
  projectTitle,
  techStack = []
) {
  const systemCtx = `You are a senior software architect, code reviewer, software metrics expert, UML expert, and IEEE 830 SRS writer.

CRITICAL RULES:
1. Return ONLY one valid JSON object.
2. No markdown fences.
3. No explanations outside JSON.
4. Every field must be present.
5. testCases.code must be a plain string.
6. UML mermaid values must be plain strings with \\n line breaks.
7. SRS must be Markdown text inside a JSON string.

STRICT MERMAID RULES:
1. Every graph or flowchart node must have an ID.
2. Correct: A[Auth Module] --> B[API Module]
3. Wrong: [Auth Module] --> [API Module]
4. Correct graph start:
   graph TD
   A[Auth Module] --> B[API Module]
5. Wrong graph start:
   graph TD[Auth Module] --> B[API Module]
6. Never include markdown fences inside Mermaid strings.
7. Use simple Mermaid syntax compatible with Mermaid 11.14.0.`;

  const prompt = `Analyse this ${language || "code"} project and return ONE JSON object with EXACTLY this structure:

{
  "language": "JavaScript",
  "frameworks": ["Express", "MongoDB"],
  "summary": "2-3 sentence summary",
  "metrics": {
    "loc": 150,
    "sloc": 120,
    "blankLines": 20,
    "commentLines": 10,
    "commentRatio": 6.7,
    "functionCount": 8,
    "avgFunctionLength": 15.0,
    "halstead": {
      "vocabulary": 45,
      "length": 180,
      "volume": 1050.5,
      "difficulty": 14.2,
      "effort": 14916.0,
      "timeToProgram": 829.8,
      "bugs": 0.35
    },
    "cyclomaticComplexity": {
      "average": 2.5,
      "max": 8,
      "perFunction": [
        {
          "name": "createUser",
          "complexity": 4
        }
      ]
    },
    "informationFlow": {
      "fanIn": 3,
      "fanOut": 5,
      "ifMetric": 2250.0
    },
    "oo": {
      "classCount": 2,
      "avgMethodsPerClass": 4.0,
      "depthOfInheritanceTree": 1,
      "couplingBetweenClasses": 3,
      "lackOfCohesionInMethods": 0.25,
      "weightedMethodsPerClass": 12.0,
      "responsesForClass": 15.0
    }
  },
  "codeQuality": {
    "score": 72,
    "maintainability": 75,
    "readability": 70,
    "testability": 65
  },
  "codeSmells": [
    {
      "type": "Long Method",
      "severity": "medium",
      "title": "Long handler function",
      "description": "Explanation",
      "line": 15,
      "suggestion": "Fix suggestion"
    }
  ],
  "optimizations": [
    {
      "type": "Performance",
      "severity": "low",
      "title": "Optimization title",
      "description": "Explanation",
      "line": 42,
      "suggestion": "Optimization suggestion"
    }
  ],
  "refactoring": [
    {
      "type": "Extract Method",
      "severity": "low",
      "title": "Refactoring title",
      "description": "Explanation",
      "line": 10,
      "suggestion": "Refactoring suggestion"
    }
  ],
  "securityIssues": [
    {
      "type": "Input Validation",
      "severity": "high",
      "title": "Security issue title",
      "description": "Explanation",
      "line": 25,
      "suggestion": "Mitigation"
    }
  ],
  "designPatterns": [
    {
      "pattern": "Repository",
      "confidence": 0.8,
      "location": "UserController"
    }
  ],
  "testCases": [
    {
      "description": "Should return 400 when email is missing",
      "type": "unit",
      "code": "test('missing email', async () => { expect(true).toBe(true); });"
    }
  ],
  "construction": {
    "codingStandards": [
      {
        "type": "NamingConvention",
        "severity": "low",
        "title": "Title",
        "description": "Description",
        "line": 5,
        "suggestion": "Suggestion"
      }
    ],
    "codeChecklist": [
      {
        "item": "Meaningful variable names used",
        "passed": true,
        "note": "Explanation"
      }
    ],
    "reviewSuggestions": ["suggestion 1", "suggestion 2"],
    "refactoringTips": ["tip 1", "tip 2"],
    "optimizationTips": ["tip 1", "tip 2"]
  },
  "umlDiagrams": [
    {
      "type": "useCaseDiagram",
      "title": "Use Case Diagram",
      "mermaid": "graph TD\\nU[User] --> SYS[System]"
    },
    {
      "type": "classDiagram",
      "title": "Class Diagram",
      "mermaid": "classDiagram\\nclass User"
    },
    {
      "type": "sequenceDiagram",
      "title": "Sequence Diagram",
      "mermaid": "sequenceDiagram\\nClient->>Server: Request\\nServer-->>Client: Response"
    },
    {
      "type": "activityDiagram",
      "title": "Activity Diagram",
      "mermaid": "flowchart TD\\nS[Start] --> E[End]"
    },
    {
      "type": "stateDiagram",
      "title": "State Diagram",
      "mermaid": "stateDiagram-v2\\n[*] --> Idle\\nIdle --> [*]"
    },
    {
      "type": "collaborationDiagram",
      "title": "Collaboration Diagram",
      "mermaid": "graph LR\\nC[Client] --> API[API Layer]"
    },
    {
      "type": "deploymentDiagram",
      "title": "Deployment Diagram",
      "mermaid": "graph TB\\nB[Browser] --> S[Server]"
    },
    {
      "type": "componentDiagram",
      "title": "Component Diagram",
      "mermaid": "graph LR\\nUI[User Interface] --> API[API Component]"
    },
    {
      "type": "packageDiagram",
      "title": "Package Diagram",
      "mermaid": "graph TD\\nR[Routes] --> M[Models]"
    }
  ],
  "srs": "Full IEEE 830 SRS in Markdown"
}

PROJECT TITLE: ${projectTitle || "Untitled Project"}
PROJECT DESCRIPTION: ${projectDescription || "Not provided"}
TECH STACK: ${(techStack || []).join(", ")}
LANGUAGE: ${language || "auto-detect"}

IMPORTANT:
- Generate realistic values based on the code.
- Return exactly 9 UML diagrams.
- Include a detailed SRS in Markdown, minimum 1200 words.
- Keep JSON valid.
- Mermaid strings must be valid Mermaid 11.14.0 syntax.

CODE:
${code.substring(0, 5000)}`;

  const raw = await callAI(prompt, systemCtx);
  const parsed = parseJSON(raw);

  parsed.umlDiagrams = normalizeUmlDiagrams(parsed.umlDiagrams || []);

  return parsed;
}

module.exports = {
  analyseMetrics,
  analyseCodeQuality,
  analyseConstruction,
  generateUMLDiagrams,
  generateSRS,
  generateStandaloneSRS,
  generateProjectPlan,
  generateFullAnalysis,
};