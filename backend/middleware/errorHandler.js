const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `${field} already exists` });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({ error: messages[0] });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ error: 'Invalid token' });
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ error: 'Token expired' });
  if (err.code === 'LIMIT_FILE_SIZE')    return res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });

  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;