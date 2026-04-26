require("dotenv").config();
console.log("ENV GEMINI =", process.env.GEMINI_API_KEY);
console.log("ENV MODEL =", process.env.GEMINI_MODEL);
// server.js — DevSpectra Express entry point

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const mongoose     = require('mongoose');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const logger       = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes     = require('./routes/auth');
const projectRoutes  = require('./routes/projects');
const analysisRoutes = require('./routes/analysis');
const exportRoutes   = require('./routes/export');
const srsRoutes      = require('./routes/srs');

const app  = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { error: 'Too many requests, please try again later.' },
}));
app.use('/api/analysis/run', rateLimit({
  windowMs: 60 * 1000, max: 10,
  message: { error: 'AI rate limit reached. Please wait a minute.' },
}));
app.use('/api/srs', rateLimit({
  windowMs: 60 * 1000, max: 5,
  message: { error: 'SRS generation rate limit reached. Please wait a minute.' },
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => { logger.info(`${req.method} ${req.originalUrl}`); next(); });
}

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/export',   exportRoutes);
app.use('/api/srs',      srsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devspectra';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => logger.info(`DevSpectra backend → http://localhost:${PORT}`));
  })
  .catch((err) => { logger.error('MongoDB failed:', err.message); process.exit(1); });

process.on('SIGTERM', async () => { await mongoose.connection.close(); process.exit(0); });
module.exports = app;
