require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const compression = require('compression');
const path = require('path');
const { sequelize } = require('./models');

// Database fix function for production
async function fixDatabaseSchema() {
  try {
    console.log('🔧 Running database schema fix...');
    
    // 1. Add paystackResponse column to Payments table
    try {
      await sequelize.query(`
        ALTER TABLE "Payments" 
        ADD COLUMN IF NOT EXISTS "paystackResponse" JSONB;
      `);
      console.log('✅ paystackResponse column added to Payments table');
    } catch (error) {
      console.log('⚠️ paystackResponse column might already exist:', error.message);
    }
    
    // 2. Create Notifications table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Notifications" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "type" VARCHAR(20) DEFAULT 'info',
          "title" VARCHAR(255) NOT NULL,
          "content" TEXT NOT NULL,
          "isRead" BOOLEAN DEFAULT false,
          "metadata" JSONB DEFAULT '{}',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Notifications table created');
    } catch (error) {
      console.log('⚠️ Notifications table might already exist:', error.message);
    }
    
    // 3. Add missing columns to Projects table
    const projectColumns = [
      { name: 'challengeId', type: 'UUID REFERENCES "Challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE' },
      { name: 'startDate', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'endDate', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'autoUnlock', type: 'BOOLEAN DEFAULT true' },
      { name: 'unlockTime', type: 'TIME DEFAULT \'00:00:00\'' },
      { name: 'unlockDelay', type: 'INTEGER DEFAULT 0' },
      { name: 'prerequisites', type: 'INTEGER[] DEFAULT \'{}\'' },
      { name: 'bonusPoints', type: 'INTEGER DEFAULT 0' },
      { name: 'penaltyPoints', type: 'INTEGER DEFAULT 0' },
      { name: 'latePenalty', type: 'DECIMAL(5,2) DEFAULT 10' },
      { name: 'allowLateSubmission', type: 'BOOLEAN DEFAULT true' },
      { name: 'maxLateHours', type: 'INTEGER DEFAULT 24' },
      { name: 'submissionLimit', type: 'INTEGER DEFAULT 1' },
      { name: 'videoUrl', type: 'VARCHAR(255)' },
      { name: 'resources', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'learningObjectives', type: 'VARCHAR(255)[] DEFAULT \'{}\'' },
      { name: 'skillsPracticed', type: 'VARCHAR(255)[] DEFAULT \'{}\'' },
      { name: 'hasLivePreview', type: 'BOOLEAN DEFAULT true' },
      { name: 'hasCodeEditor', type: 'BOOLEAN DEFAULT true' },
      { name: 'hasAutoTest', type: 'BOOLEAN DEFAULT false' },
      { name: 'testCases', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'totalSubmissions', type: 'INTEGER DEFAULT 0' },
      { name: 'averageScore', type: 'DECIMAL(5,2) DEFAULT 0' },
      { name: 'completionRate', type: 'DECIMAL(5,2) DEFAULT 0' },
      { name: 'averageTimeSpent', type: 'INTEGER DEFAULT 0' },
      { name: 'settings', type: 'JSONB DEFAULT \'{}\'' }
    ];
    
    // 4. Add missing columns to AssignmentSubmissions table
    const assignmentSubmissionColumns = [
      { name: 'githubLink', type: 'VARCHAR(500)' },
      { name: 'codeSubmission', type: 'JSONB DEFAULT \'{"html": "", "css": "", "javascript": ""}\'' },
      { name: 'zipFileUrl', type: 'VARCHAR(500)' },
      { name: 'submittedAt', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      { name: 'status', type: 'VARCHAR(20) DEFAULT \'pending\'' },
      { name: 'score', type: 'INTEGER DEFAULT 0' },
      { name: 'isLate', type: 'BOOLEAN DEFAULT false' },
      { name: 'latePenalty', type: 'INTEGER DEFAULT 0' },
      { name: 'adminFeedback', type: 'TEXT' },
      { name: 'adminComments', type: 'TEXT' },
      { name: 'reviewedBy', type: 'UUID REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE' },
      { name: 'reviewedAt', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'bonusPoints', type: 'INTEGER DEFAULT 0' },
      { name: 'deductions', type: 'INTEGER DEFAULT 0' },
      { name: 'finalScore', type: 'INTEGER DEFAULT 0' },
      { name: 'metadata', type: 'JSONB DEFAULT \'{}\'' }
    ];
    
    for (const column of projectColumns) {
      try {
        await sequelize.query(`
          ALTER TABLE "Projects" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};
        `);
        console.log(`✅ Added column ${column.name} to Projects table`);
      } catch (error) {
        console.log(`⚠️ Column ${column.name} might already exist:`, error.message);
      }
    }
    
    // Add missing columns to AssignmentSubmissions table
    for (const column of assignmentSubmissionColumns) {
      try {
        await sequelize.query(`
          ALTER TABLE "AssignmentSubmissions" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};
        `);
        console.log(`✅ Added column ${column.name} to AssignmentSubmissions table`);
      } catch (error) {
        console.log(`⚠️ Column ${column.name} might already exist:`, error.message);
      }
    }
    
    // 5. Add missing columns to Classes table
    console.log('📝 Adding metadata column to Classes table...');
    try {
      await sequelize.query(`
        ALTER TABLE "Classes" 
        ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';
      `);
      console.log('✅ metadata column added to Classes table');
    } catch (error) {
      console.log('⚠️ metadata column might already exist:', error.message);
    }
    
    console.log('🎉 Database schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Database schema fix failed:', error);
  }
}

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

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.paystack.co"]
    }
  }
}));

app.use(cors({
  origin: [
    'http://localhost:3000', // Development
    'https://your-frontend-app.vercel.app', // Production - Update this
    process.env.FRONTEND_URL // Environment variable
  ].filter(Boolean),
  credentials: true
}));

// Compression middleware
app.use(compression());

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
    
    // Run database fix in production
    if (process.env.NODE_ENV === 'production') {
      await fixDatabaseSchema();
    }
    
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