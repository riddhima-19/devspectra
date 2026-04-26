// routes/analysis.js
const express   = require('express');
const Project   = require('../models/Project');
const Analysis  = require('../models/Analysis');
const User      = require('../models/User');
const { protect } = require('../middleware/auth');
const aiService   = require('../services/aiService');
const { computeBasicStats, detectLanguage } = require('../utils/codeStats');
const {
  sanitizeQualityResult,
  sanitizeConstructionResult,
  sanitizeMetrics,
  ensureUmlArray,
  ensureStringArray,
} = require('../utils/sanitize');
const logger = require('../utils/logger');

const router = express.Router();

// Collect all code text from a project
function collectCode(project) {
  const parts = [];
  if (project.sourceCode && project.sourceCode.trim()) {
    parts.push(project.sourceCode);
  }
  for (const f of project.files || []) {
    if (f.content && f.content.trim()) {
      parts.push(`// ── File: ${f.originalName} ──\n${f.content}`);
    }
  }
  return parts.join('\n\n// ─────────────────────\n\n');
}

// POST /api/analysis/run/:projectId
router.post('/run/:projectId', protect, async (req, res, next) => {
  const startTime = Date.now();

  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const code = collectCode(project);

    if (!code.trim()) {
      return res.status(400).json({
        error: 'No source code found. Please add code or upload files.',
      });
    }

    // Fast local stats (no AI)
    const quickStats   = computeBasicStats(code);
    const detectedLang = detectLanguage(
      project.files?.[0]?.originalName || '',
      code
    );
    const language = project.techStack?.[0] || detectedLang || 'auto-detect';

    // Create analysis record immediately so frontend can poll it
    const analysis = await Analysis.create({
      project: project._id,
      owner: req.user._id,
      status: 'processing',
      language,
      metrics: {
        loc: quickStats.loc,
        sloc: quickStats.sloc,
        blankLines: quickStats.blankLines,
        commentLines: quickStats.commentLines,
        commentRatio: quickStats.commentRatio,
        functionCount: quickStats.functionCount,
      },
    });

    await Project.findByIdAndUpdate(project._id, { status: 'analyzing' });

    // Return 202 immediately — analysis runs in background
    res.status(202).json({
      message: 'Analysis started',
      analysisId: analysis._id,
    });

    // Run AI pipeline asynchronously
    setImmediate(async () => {
      try {
        logger.info(`AI analysis started for: "${project.title}"`);

        // ONE FULL AI CALL — reduces Gemini free-tier quota usage
        const fullRaw = await aiService.generateFullAnalysis(
          code,
          language,
          project.description,
          project.title,
          project.techStack || []
        );
        console.log("UML DIAGRAMS RAW:", JSON.stringify(fullRaw.umlDiagrams, null, 2));
        
        // Sanitize all AI outputs before saving
        const cleanMetrics      = sanitizeMetrics(fullRaw.metrics);
        const cleanQuality      = sanitizeQualityResult(fullRaw);
        const cleanConstruction = sanitizeConstructionResult(fullRaw.construction || {});
        const cleanUml          = ensureUmlArray(fullRaw.umlDiagrams || []);
        const cleanFrameworks   = ensureStringArray(fullRaw.frameworks);

        // Save complete sanitized results
        await Analysis.findByIdAndUpdate(analysis._id, {
          status: 'completed',

          language: String(fullRaw.language || language),
          frameworks: cleanFrameworks,
          summary: String(fullRaw.summary || ''),

          metrics: cleanMetrics,

          codeQuality: {
            score:           Number(fullRaw.codeQuality?.score) || 0,
            maintainability: Number(fullRaw.codeQuality?.maintainability) || 0,
            readability:     Number(fullRaw.codeQuality?.readability) || 0,
            testability:     Number(fullRaw.codeQuality?.testability) || 0,
          },

          codeSmells:     cleanQuality.codeSmells,
          optimizations:  cleanQuality.optimizations,
          refactoring:    cleanQuality.refactoring,
          securityIssues: cleanQuality.securityIssues,
          designPatterns: cleanQuality.designPatterns,
          testCases:      cleanQuality.testCases,

          construction: cleanConstruction,
          umlDiagrams: cleanUml,

          srs: {
            raw: String(fullRaw.srs || ''),
            generatedAt: new Date(),
            wordCount: fullRaw.srs ? fullRaw.srs.split(/\s+/).length : 0,
          },

          processingTime: Date.now() - startTime,
        });

        // Update project + user counters
        await Promise.all([
          Project.findByIdAndUpdate(project._id, {
            status: 'completed',
            lastAnalysedAt: new Date(),
            $inc: { analysisCount: 1 },
          }),
          User.findByIdAndUpdate(req.user._id, {
            $inc: { 'stats.totalAnalyses': 1 },
          }),
        ]);

        logger.info(
          `Analysis complete: "${project.title}" — ${Date.now() - startTime}ms`
        );
      } catch (aiErr) {
        logger.error(`Analysis failed for ${project._id}:`, aiErr.message);

        await Promise.all([
          Analysis.findByIdAndUpdate(analysis._id, {
            status: 'failed',
            errorMessage: aiErr.message || 'AI error',
          }),
          Project.findByIdAndUpdate(project._id, { status: 'failed' }),
        ]);
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analysis/status/:id
router.get('/status/:id', protect, async (req, res, next) => {
  try {
    const a = await Analysis.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).select('status errorMessage processingTime');

    if (!a) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      status: a.status,
      errorMessage: a.errorMessage || null,
      processingTime: a.processingTime || null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analysis/project/:projectId
router.get('/project/:projectId', protect, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const analysis = await Analysis.findOne({ project: project._id })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({ error: 'No analysis found' });
    }

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

// GET /api/analysis/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

// GET /api/analysis
router.get('/', protect, async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('project', 'title')
      .select('status language codeQuality metrics.loc processingTime createdAt project');

    res.json({ analyses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;