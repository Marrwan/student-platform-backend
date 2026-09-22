const { Assignment, Class, User, ClassEnrollment, sequelize } = require('./models');

async function renderDiagnostic() {
  try {
    console.log('🔍 Render Deployment Diagnostic\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
    console.log(`  PORT: ${process.env.PORT || 'NOT SET'}`);
    console.log(`  DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
    console.log(`  DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
    console.log(`  DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
    console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}`);
    console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
    console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
    console.log('');

    // Test database connection
    console.log('🔌 Database Connection Test:');
    try {
      await sequelize.authenticate();
      console.log('  ✅ Database connection successful');
    } catch (error) {
      console.log('  ❌ Database connection failed:', error.message);
      return;
    }

    // Check if tables exist
    console.log('\n🗄️ Database Tables Check:');
    try {
      const tables = await sequelize.showAllSchemas();
      console.log('  ✅ Database tables accessible');
    } catch (error) {
      console.log('  ❌ Cannot access database tables:', error.message);
      return;
    }

    // Check migrations status
    console.log('\n🔄 Migrations Status:');
    try {
      const { execSync } = require('child_process');
      const migrationStatus = execSync('npx sequelize-cli db:migrate:status', { encoding: 'utf8' });
      console.log('  ✅ Migrations status check successful');
      console.log('  📝 Migration output:');
      console.log(migrationStatus);
    } catch (error) {
      console.log('  ❌ Migration status check failed:', error.message);
    }

    // Check if assignments table exists and has data
    console.log('\n📝 Assignments Table Check:');
    try {
      const assignmentCount = await Assignment.count();
      console.log(`  📊 Total assignments in database: ${assignmentCount}`);
      
      if (assignmentCount > 0) {
        const assignments = await Assignment.findAll({
          include: [{
            model: Class,
            as: 'class',
            attributes: ['name']
          }],
          limit: 5
        });
        
        console.log('  📋 Recent assignments:');
        assignments.forEach((assignment, index) => {
          console.log(`    ${index + 1}. ${assignment.title} (Class: ${assignment.class.name})`);
          console.log(`       Status: isUnlocked=${assignment.isUnlocked}, isActive=${assignment.isActive}`);
          console.log(`       Created: ${assignment.createdAt}`);
        });
      } else {
        console.log('  ⚠️ No assignments found in database');
      }
    } catch (error) {
      console.log('  ❌ Error checking assignments:', error.message);
    }

    // Check users and enrollments
    console.log('\n👥 Users and Enrollments Check:');
    try {
      const userCount = await User.count();
      const studentCount = await User.count({ where: { role: 'student' } });
      const adminCount = await User.count({ where: { role: 'admin' } });
      const enrollmentCount = await ClassEnrollment.count();
      
      console.log(`  👤 Total users: ${userCount}`);
      console.log(`  🎓 Students: ${studentCount}`);
      console.log(`  👨‍🏫 Admins: ${adminCount}`);
      console.log(`  📚 Enrollments: ${enrollmentCount}`);
      
      if (enrollmentCount > 0) {
        const enrollments = await ClassEnrollment.findAll({
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['firstName', 'lastName', 'email', 'role']
            },
            {
              model: Class,
              as: 'class',
              attributes: ['name']
            }
          ],
          limit: 3
        });
        
        console.log('  📋 Recent enrollments:');
        enrollments.forEach((enrollment, index) => {
          console.log(`    ${index + 1}. ${enrollment.student.firstName} ${enrollment.student.lastName} (${enrollment.student.email})`);
          console.log(`       Role: ${enrollment.student.role}`);
          console.log(`       Class: ${enrollment.class.name}`);
          console.log(`       Enrolled: ${enrollment.createdAt}`);
        });
      }
    } catch (error) {
      console.log('  ❌ Error checking users/enrollments:', error.message);
    }

    // Test assignment fetching logic
    console.log('\n🔍 Assignment Fetching Test:');
    try {
      const testStudent = await User.findOne({
        where: { role: 'student' }
      });

      if (testStudent) {
        console.log(`  👤 Testing with student: ${testStudent.firstName} ${testStudent.lastName}`);
        
        const enrollments = await ClassEnrollment.findAll({
          where: { userId: testStudent.id },
          attributes: ['classId']
        });
        
        const classIds = enrollments.map(e => e.classId);
        console.log(`  📚 Student's class IDs: ${classIds.join(', ')}`);
        
        if (classIds.length > 0) {
          const { Op } = require('sequelize');
          const assignments = await Assignment.findAll({
            where: {
              classId: { [Op.in]: classIds },
              isUnlocked: true,
              isActive: true
            }
          });
          
          console.log(`  📝 Assignments found for student: ${assignments.length}`);
          
          if (assignments.length > 0) {
            assignments.forEach((assignment, index) => {
              console.log(`    ${index + 1}. ${assignment.title}`);
              console.log(`       Can Submit: ${assignment.canSubmit()}`);
            });
          }
        } else {
          console.log('  ⚠️ Student not enrolled in any classes');
        }
      } else {
        console.log('  ⚠️ No students found in database');
      }
    } catch (error) {
      console.log('  ❌ Error testing assignment fetching:', error.message);
    }

    console.log('\n🎉 Render diagnostic completed!');
    
    // Provide recommendations
    console.log('\n💡 Recommendations:');
    if (process.env.NODE_ENV !== 'production') {
      console.log('  ⚠️ NODE_ENV should be set to "production" on Render');
    }
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
      console.log('  ⚠️ Database environment variables may not be set correctly');
    }
    if (!process.env.JWT_SECRET) {
      console.log('  ⚠️ JWT_SECRET should be set for production');
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run the diagnostic if this script is executed directly
if (require.main === module) {
  renderDiagnostic().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { renderDiagnostic };

