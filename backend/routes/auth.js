const express   = require('express');
const jwt       = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User      = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      const user  = await User.create({ name, email, password });
      const token = signToken(user._id);
      res.status(201).json({ message: 'Account created successfully', token, user: user.toJSON() });
    } catch (err) { next(err); }
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      const token = signToken(user._id);
      res.json({ token, user: user.toJSON() });
    } catch (err) { next(err); }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// PUT /api/auth/profile
router.put('/profile', protect,
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 300 }),
  ],
  async (req, res, next) => {
    try {
      const { name, bio, preferences } = req.body;
      const updates = {};
      if (name)              updates.name        = name;
      if (bio !== undefined) updates.bio         = bio;
      if (preferences)       updates.preferences = { ...req.user.preferences, ...preferences };
      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
      res.json({ user });
    } catch (err) { next(err); }
  }
);

// PUT /api/auth/password
router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(422).json({ error: 'New password must be at least 8 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

module.exports = router;