import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Prioritize httpOnly cookie
  if (req.cookies && (req.cookies.token || req.cookies.lumina_token)) {
    token = req.cookies.token || req.cookies.lumina_token;
  }
  // 2. Fallback to Authorization header Bearer token
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lumina_super_secret_jwt_key_2026_x99');
    
    let user;
    try {
      user = await User.findById(decoded.id);
    } catch (err) {
      user = null;
    }

    if (user) {
      req.user = user;
    } else {
      req.user = {
        _id: decoded.id,
        role: decoded.role || 'user',
        name: 'Logged In User',
        email: 'user@lumina.com',
        isVerified: true
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Authorization failed.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.`
      });
    }
    next();
  };
};
