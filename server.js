require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const compression = require('compression');
const path = require('path');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const projectRoutes = require('./routes/projects.routes');
const submissionRoutes = require('./routes/submissions.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const classesRoutes = require('./routes/classes.routes');
const assignmentsRoutes = require('./routes/assignments.routes');
const challengesRoutes = require('./routes/challenges.routes');
const paymentsRoutes = require('./routes/payments.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const weeklyAttendanceRoutes = require('./routes/weeklyAttendance.routes');
const hrmsRoutes = require('./routes/hrms.routes');
const appraisalRoutes = require('./routes/appraisals.routes');
const payrollRoutes = require('./routes/payroll.routes');
const rbacRoutes = require('./routes/rbac.routes');

const app = express();

// Request Duration Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.paystack.co", "https://strangedevclass.netlify.app", "https://*.netlify.app"]
    }
  }
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://strangedevclass.netlify.app',
      'https://student-platform-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow non-browser requests or same-origin (no origin header)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Also allow any netlify.app subdomain
    if (origin && origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    console.log(`CORS blocked for origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length']
}));

// Explicitly handle preflight requests
app.options('*', cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://strangedevclass.netlify.app',
      'https://student-platform-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow non-browser requests or same-origin (no origin header)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Also allow any netlify.app subdomain
    if (origin && origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Compression middleware
app.use(compression());

// CORS debugging middleware
app.use((req, res, next) => {
  console.log(`[CORS Debug] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Specific CORS handler for assignment submission
app.use('/api/assignments/:id/submit', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://strangedevclass.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 600 * 60 * 1000, // 1 hour
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false
// });

// // Slow down repeated requests
// const speedLimiter = slowDown({
//   windowMs: 600 * 60 * 1000, // 1 hour
//   delayAfter: 50, // allow 50 requests per 15 minutes, then...
//   delayMs: () => 500 // begin adding 500ms of delay per request above 50
// });

// app.use('/api/', limiter);
// app.use('/api/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/weekly-attendance', weeklyAttendanceRoutes);
app.use('/api/hrms', hrmsRoutes);
app.use('/api/appraisals', appraisalRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/rbac', rbacRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Duplicate entry',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'File size exceeds the limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field',
      message: 'File field name not expected'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Authentication token has expired'
    });
  }

  // Paystack errors
  if (err.message && err.message.includes('Paystack')) {
    return res.status(400).json({
      error: 'Payment error',
      message: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Serve frontend in production (commented out since we're deploying separately)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/out')));
//   
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
//   });
// }

const PORT = process.env.PORT || 5000;

// Test database connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');



    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      //   await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`💳 Paystack Integration: ${process.env.PAYSTACK_SECRET_KEY ? 'Enabled' : 'Disabled'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer(); 