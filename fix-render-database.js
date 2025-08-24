require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database configuration - use the same config as the main app
const dbConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'javascript_challenge',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
};

const sequelize = new Sequelize(dbConfig);

async function fixDatabase() {
  try {
    console.log('🔧 Starting database fix for Render...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // 1. Add paystackResponse column to Payments table
    console.log('📝 Adding paystackResponse column to Payments table...');
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
    console.log('📝 Creating Notifications table...');
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
    console.log('📝 Adding missing columns to Projects table...');
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
    
    // 4. Add missing columns to AssignmentSubmissions table
    console.log('📝 Adding missing columns to AssignmentSubmissions table...');
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
    
    // 5. Create missing tables if they don't exist
    console.log('📝 Creating missing tables...');
    
    // ClassEnrollments table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ClassEnrollments" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "classId" UUID NOT NULL REFERENCES "Classes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "enrolledAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "status" VARCHAR(20) DEFAULT 'active',
          "metadata" JSONB DEFAULT '{}',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE("userId", "classId")
        );
      `);
      console.log('✅ ClassEnrollments table created');
    } catch (error) {
      console.log('⚠️ ClassEnrollments table might already exist:', error.message);
    }
    
    // Assignments table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Assignments" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "classId" UUID NOT NULL REFERENCES "Classes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
          "maxScore" INTEGER DEFAULT 100,
          "type" VARCHAR(50) DEFAULT 'project',
          "status" VARCHAR(20) DEFAULT 'active',
          "metadata" JSONB DEFAULT '{}',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Assignments table created');
    } catch (error) {
      console.log('⚠️ Assignments table might already exist:', error.message);
    }
    
    // AssignmentSubmissions table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "AssignmentSubmissions" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "assignmentId" UUID NOT NULL REFERENCES "Assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "submissionUrl" VARCHAR(500),
          "submissionText" TEXT,
          "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "score" INTEGER,
          "feedback" TEXT,
          "status" VARCHAR(20) DEFAULT 'submitted',
          "metadata" JSONB DEFAULT '{}',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ AssignmentSubmissions table created');
    } catch (error) {
      console.log('⚠️ AssignmentSubmissions table might already exist:', error.message);
    }
    
    // PlagiarismReports table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "PlagiarismReports" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "submissionId" UUID NOT NULL REFERENCES "Submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "reportedBy" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "reason" TEXT NOT NULL,
          "evidence" JSONB DEFAULT '{}',
          "status" VARCHAR(20) DEFAULT 'pending',
          "resolvedBy" UUID REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
          "resolution" TEXT,
          "resolvedAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ PlagiarismReports table created');
    } catch (error) {
      console.log('⚠️ PlagiarismReports table might already exist:', error.message);
    }
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixDatabase();
