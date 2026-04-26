require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Project  = require('../models/Project');

const SAMPLE_CODE = `
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');

const users = [];

router.get('/', (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email })));
});

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(409).json({ error: 'Email taken' });
  const hashed = await bcrypt.hash(password, 10);
  const user   = { id: users.length + 1, name, email, password: hashed };
  users.push(user);
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email });
});

router.delete('/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.json({ message: 'User deleted' });
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = router;
`;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devspectra');
    console.log('Connected to MongoDB');
    await User.deleteOne({ email: 'demo@devspectra.io' });
    const user = await User.create({
      name: 'Demo User', email: 'demo@devspectra.io', password: 'demo1234',
    });
    console.log('Created demo user: demo@devspectra.io / demo1234');
    await Project.create({
      owner: user._id, title: 'Sample REST API',
      description: 'A simple Express.js REST API — great for testing DevSpectra analysis.',
      techStack: ['Node.js', 'Express', 'JavaScript'],
      sourceCode: SAMPLE_CODE, tags: ['demo', 'express', 'api'],
    });
    console.log('Created sample project');
    console.log('\nSeed complete! Login: demo@devspectra.io / demo1234\n');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

seed();