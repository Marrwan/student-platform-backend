const { Assignment, Class, User, ClassEnrollment, sequelize } = require('./models');
const { execSync } = require('child_process');

async function fixRenderIssues() {
  try {
    console.log('🔧 Fixing Render Deployment Issues\n');
    
    // 1. Check and run migrations
    console.log('🔄 Step 1: Running database migrations...');
    try {
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      console.log('  ✅ Migrations completed successfully');
    } catch (error) {
      console.log('  ❌ Migration failed:', error.message);
      console.log('  ⚠️ Continuing with other fixes...');
    }

    // 2. Check if assignments table exists
    console.log('\n📝 Step 2: Checking assignments table...');
    try {
      const assignmentCount = await Assignment.count();
      console.log(`  📊 Total assignments: ${assignmentCount}`);
      
      if (assignmentCount === 0) {
        console.log('  ⚠️ No assignments found. Creating a test assignment...');
        
        // Get the first class
        const classData = await Class.findOne({
          include: [{
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName']
          }]
        });

        if (classData) {
          const testAssignment = await Assignment.create({
            title: 'Welcome Assignment - HTML Basics',
            description: 'This is a welcome assignment to get you started with HTML. Create a simple webpage with a heading and a paragraph.',
            classId: classData.id,
            type: 'html',
            difficulty: 'easy',
            maxScore: 100,
            startDate: new Date(),
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            requirements: 'Create an HTML page with:\n1. A main heading (h1)\n2. A paragraph with some text\n3. Basic styling',
            sampleOutputUrl: 'https://example.com/sample-output',
            sampleOutputCode: {
              html: '<h1>Welcome to HTML Basics</h1><p>This is a sample paragraph.</p>',
              css: 'h1 { color: blue; } p { font-size: 16px; }',
              javascript: ''
            },
            submissionMode: 'both',
            latePenalty: 10,
            allowLateSubmission: true,
            maxLateHours: 24,
            paymentRequired: false,
            paymentAmount: 500,
            isUnlocked: true,
            isActive: true
          });

          console.log(`  ✅ Created test assignment: ${testAssignment.title}`);
        } else {
          console.log('  ❌ No classes found. Cannot create test assignment.');
        }
      }
    } catch (error) {
      console.log('  ❌ Error checking assignments:', error.message);
    }

    // 3. Check and fix assignment status
    console.log('\n🔓 Step 3: Checking assignment status...');
    try {
      const lockedAssignments = await Assignment.findAll({
        where: {
          isUnlocked: false,
          isActive: true,
          deadline: {
            [require('sequelize').Op.gt]: new Date() // deadline is in the future
          }
        }
      });

      if (lockedAssignments.length > 0) {
        console.log(`  🔓 Found ${lockedAssignments.length} locked assignments. Unlocking them...`);
        
        await Assignment.update(
          { isUnlocked: true },
          {
            where: {
              id: {
                [require('sequelize').Op.in]: lockedAssignments.map(a => a.id)
              }
            }
          }
        );

        console.log('  ✅ Successfully unlocked assignments');
      } else {
        console.log('  ✅ All assignments are properly unlocked');
      }
    } catch (error) {
      console.log('  ❌ Error checking assignment status:', error.message);
    }

    // 4. Check user enrollments
    console.log('\n👥 Step 4: Checking user enrollments...');
    try {
      const students = await User.findAll({
        where: { role: 'student' },
        include: [{
          model: ClassEnrollment,
          as: 'enrollments',
          include: [{
            model: Class,
            as: 'class',
            attributes: ['name']
          }]
        }]
      });

      console.log(`  👤 Found ${students.length} students`);
      
      students.forEach((student, index) => {
        console.log(`    ${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`);
        console.log(`       Enrollments: ${student.enrollments.length}`);
        student.enrollments.forEach(enrollment => {
          console.log(`         - ${enrollment.class.name}`);
        });
      });
    } catch (error) {
      console.log('  ❌ Error checking enrollments:', error.message);
    }

    // 5. Verify assignment visibility
    console.log('\n🔍 Step 5: Verifying assignment visibility...');
    try {
      const testStudent = await User.findOne({
        where: { role: 'student' }
      });

      if (testStudent) {
        const enrollments = await ClassEnrollment.findAll({
          where: { userId: testStudent.id },
          attributes: ['classId']
        });
        
        const classIds = enrollments.map(e => e.classId);
        
        if (classIds.length > 0) {
          const { Op } = require('sequelize');
          const assignments = await Assignment.findAll({
            where: {
              classId: { [Op.in]: classIds },
              isUnlocked: true,
              isActive: true
            }
          });
          
          console.log(`  📝 Student can see ${assignments.length} assignments`);
          
          if (assignments.length > 0) {
            assignments.forEach((assignment, index) => {
              console.log(`    ${index + 1}. ${assignment.title}`);
              console.log(`       Can Submit: ${assignment.canSubmit()}`);
            });
          }
        } else {
          console.log('  ⚠️ Student not enrolled in any classes');
        }
      }
    } catch (error) {
      console.log('  ❌ Error verifying assignment visibility:', error.message);
    }

    console.log('\n🎉 Render issues fix completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Check your Render deployment logs');
    console.log('2. Verify the frontend can connect to the backend');
    console.log('3. Test assignment creation and visibility');

  } catch (error) {
    console.error('❌ Error fixing Render issues:', error);
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixRenderIssues().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { fixRenderIssues };

