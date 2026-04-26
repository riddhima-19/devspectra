// routes/srs.js — Standalone SRS generation route (no code required)
const express   = require('express');
const { protect } = require('../middleware/auth');
const { generateStandaloneSRS, generateProjectPlan } = require('../services/aiService');
const logger    = require('../utils/logger');

const router = express.Router();

// POST /api/srs/generate — generate SRS from project details form
router.post('/generate', protect, async (req, res, next) => {
  try {
    const { name, purpose, scope, targetUsers, features, techStack, timeline } = req.body;
    if (!name || !purpose || !targetUsers || !features) {
      return res.status(400).json({
        error: 'Missing required fields: name, purpose, targetUsers, features',
      });
    }
    logger.info(`Generating standalone SRS for: "${name}"`);
    const srsMarkdown = await generateStandaloneSRS({ name, purpose, scope, targetUsers, features, techStack, timeline });
    res.json({
      srs:       srsMarkdown,
      wordCount: srsMarkdown.split(/\s+/).length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('SRS generation error:', err);
    next(err);
  }
});

// POST /api/srs/project-plan — generate project plan + Gantt chart
router.post('/project-plan', protect, async (req, res, next) => {
  try {
    const { name, purpose, features, timeline, teamSize } = req.body;
    if (!name || !purpose || !features) {
      return res.status(400).json({ error: 'Missing required fields: name, purpose, features' });
    }
    logger.info(`Generating project plan for: "${name}"`);
    const plan = await generateProjectPlan({ name, purpose, features, timeline, teamSize });
    res.json({ plan });
  } catch (err) {
    logger.error('Project plan generation error:', err);
    next(err);
  }
});

// GET /api/srs/download — stream SRS markdown as downloadable file
router.post('/download', protect, (req, res) => {
  try {
    const { srs, projectName } = req.body;
    if (!srs) return res.status(400).json({ error: 'No SRS content provided' });
    const filename = `SRS_${(projectName || 'project').replace(/[^a-z0-9]/gi, '_')}.md`;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(srs);
  } catch (err) { next(err); }
});

module.exports = router;
