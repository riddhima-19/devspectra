const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided, authorisation denied' });
    }
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')  return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError')  return res.status(401).json({ error: 'Invalid token' });
    next(err);
  }
};

const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token   = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user      = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {}
  next();
};

module.exports = { protect, optionalAuth };