const express      = require('express');
const Analysis     = require('../models/Analysis');
const { protect }  = require('../middleware/auth');
const { generatePdf } = require('../utils/pdfGenerator');
const logger       = require('../utils/logger');

const router = express.Router();

// GET /api/export/srs-pdf/:analysisId
router.get('/srs-pdf/:analysisId', protect, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.analysisId, owner: req.user._id })
      .populate('project', 'title');
    if (!analysis)          return res.status(404).json({ error: 'Analysis not found' });
    if (!analysis.srs?.raw) return res.status(400).json({ error: 'SRS not yet generated' });
    const title    = analysis.project?.title || 'Project';
    const pdf      = await generatePdf(analysis.srs.raw, title);
    const filename = `SRS_${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length',      pdf.length);
    res.send(pdf);
  } catch (err) { logger.error('PDF export error:', err); next(err); }
});

// GET /api/export/report-json/:analysisId
router.get('/report-json/:analysisId', protect, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.analysisId, owner: req.user._id })
      .populate('project', 'title description techStack githubUrl');
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    const filename = `DevSpectra_${(analysis.project?.title || 'report').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
    res.setHeader('Content-Type',        'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      meta: { tool: 'DevSpectra', version: '1.0.0', generatedAt: new Date().toISOString() },
      project: analysis.project,
      analysis: analysis.toObject(),
    });
  } catch (err) { next(err); }
});

// GET /api/export/srs-md/:analysisId
router.get('/srs-md/:analysisId', protect, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.analysisId, owner: req.user._id })
      .populate('project', 'title');
    if (!analysis)          return res.status(404).json({ error: 'Analysis not found' });
    if (!analysis.srs?.raw) return res.status(400).json({ error: 'SRS not yet generated' });
    const filename = `SRS_${(analysis.project?.title || 'project').replace(/[^a-z0-9]/gi, '_')}.md`;
    res.setHeader('Content-Type',        'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(analysis.srs.raw);
  } catch (err) { next(err); }
});

// GET /api/export/uml/:analysisId/:type
router.get('/uml/:analysisId/:type', protect, async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.analysisId, owner: req.user._id });
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    const diagram  = analysis.umlDiagrams?.find(d => d.type === req.params.type);
    if (!diagram)  return res.status(404).json({ error: `Diagram type not found` });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${diagram.type}_${Date.now()}.mmd"`);
    res.send(diagram.mermaid);
  } catch (err) { next(err); }
});

module.exports = router;