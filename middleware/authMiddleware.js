const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read token from cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Alternately check Auth header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_ems_jwt_key_987654321');

    // Get user from the database and populate employee details
    req.user = await User.findById(decoded.id).populate('employeeId');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
