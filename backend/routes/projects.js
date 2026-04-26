const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const Project  = require('../models/Project');
const Analysis = require('../models/Analysis');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const ALLOWED = [
  '.js','.ts','.jsx','.tsx','.py','.java','.cpp','.c','.cs',
  '.go','.rb','.php','.swift','.kt','.rs','.html','.css',
  '.json','.xml','.yaml','.yml','.sql','.sh','.md','.txt',
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED.includes(ext) ? cb(null, true) : cb(new Error(`File type ${ext} not allowed`));
  },
});

const readFileContent = (filePath) => {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
};

// GET /api/projects
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;
    if (search) query.$or = [
      { title:       new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
    const [projects, total] = await Promise.all([
      Project.find(query).sort({ updatedAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
      Project.countDocuments(query),
    ]);
    res.json({ projects, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', protect, upload.array('files', 20),
  [body('title').trim().notEmpty().withMessage('Title is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
      const { title, description, techStack, githubUrl, sourceCode, tags } = req.body;
      const files = (req.files || []).map(f => ({
        originalName: f.originalname, storedName: f.filename,
        path: f.path, size: f.size, mimetype: f.mimetype,
        content: readFileContent(f.path),
      }));
      const project = await Project.create({
        owner: req.user._id, title, description,
        techStack:  techStack  ? JSON.parse(techStack)  : [],
        githubUrl,  sourceCode, files,
        tags:       tags       ? JSON.parse(tags)       : [],
      });
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalProjects': 1 } });
      res.status(201).json({ project });
    } catch (err) { next(err); }
  }
);

// GET /api/projects/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const analysis = await Analysis.findOne({ project: project._id }).sort({ createdAt: -1 }).lean();
    res.json({ project, analysis });
  } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', protect, upload.array('newFiles', 10), async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { title, description, techStack, githubUrl, sourceCode, tags } = req.body;
    if (title)                    project.title       = title;
    if (description !== undefined) project.description = description;
    if (techStack)                project.techStack   = JSON.parse(techStack);
    if (githubUrl !== undefined)  project.githubUrl   = githubUrl;
    if (sourceCode !== undefined) project.sourceCode  = sourceCode;
    if (tags)                     project.tags        = JSON.parse(tags);
    if (req.files?.length) {
      project.files.push(...req.files.map(f => ({
        originalName: f.originalname, storedName: f.filename,
        path: f.path, size: f.size, mimetype: f.mimetype,
        content: readFileContent(f.path),
      })));
    }
    await project.save();
    res.json({ project });
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    for (const f of project.files) {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    }
    await Promise.all([
      project.deleteOne(),
      Analysis.deleteMany({ project: project._id }),
    ]);
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalProjects': -1 } });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
});

module.exports = router;