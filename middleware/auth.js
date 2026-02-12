const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Performance logging
    const dbStart = Date.now();
    const user = await User.findByPk(decoded.id);
    const dbDuration = Date.now() - dbStart;

    if (dbDuration > 500) {
      console.log(`[SLOW DB] User.findByPk took ${dbDuration}ms for user ${decoded.id}`);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'partial_admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  next();
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'student' && req.user.role !== 'admin' && req.user.role !== 'partial_admin') {
    return res.status(403).json({ message: 'Access denied. User privileges required.' });
  }

  next();
};

const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Admin and partial_admin are always staff. Also users with a staffRole set.
  if (req.user.role === 'admin' || req.user.role === 'partial_admin' || (req.user.staffRole && req.user.staffRole !== 'null')) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Staff privileges required.' });
};

const authorize = (roles = []) => {
  // roles param can be a single role string or an array of roles
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      // Also allow admins to access everything if not explicitly forbidden? 
      // For now, strict check based on the passed roles.
      // But we should probably include 'admin' implicitly if it's a hierarchy, 
      // or rely on the route definition to include 'admin'.
      // The current route is: authorize(['admin', 'manager', 'mentor']) so it includes admin.
      return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(', ')}` });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  auth: authenticateToken,
  requireRole,
  requireAdmin,
  isAdmin: requireAdmin,
  requireUser,
  requireStaff,
  requireStaff,
  isStaff: requireStaff,
  authorize
}; 