
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in the environment');
}

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. A valid authentication token is required.'
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await AuthUser.findById(decoded.id).select('_id role');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or no longer active.'
      });
    }

    req.user = {
      id: String(user._id),
      role: user.role
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError' ||
        err.name === 'CastError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }

    next(err);
  }
};

auth.authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Your role cannot perform this action.'
    });
  }

  next();
};

module.exports = auth;
