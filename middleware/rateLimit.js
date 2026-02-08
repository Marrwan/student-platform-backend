const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiter for verification endpoints (resend verification, login attempts)
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many verification attempts',
    message: 'Too many verification attempts from this IP. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use email + IP for more granular rate limiting
    const email = req.body.email || req.body.verificationOtp || 'unknown';
    return `${req.ip}-${email}`;
  }
});

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    const email = req.body.email || 'unknown';
    return `${req.ip}-${email}`;
  }
});

// Rate limiter for registration
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registrations per hour
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts from this IP. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Too many password reset attempts from this IP. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    const email = req.body.email || 'unknown';
    return `${req.ip}-${email}`;
  }
});

// Speed limiter for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (hits) => hits * 100, // begin adding 100ms of delay per request above 50
  maxDelayMs: 2000, // maximum delay of 2 seconds
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

module.exports = {
  verificationLimiter,
  loginLimiter,
  registrationLimiter,
  passwordResetLimiter,
  speedLimiter,
  apiLimiter
};
