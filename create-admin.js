require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('./models');

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('Abdul2019!', 12);
    
    // Create admin user data
    const adminUser = {
      id: uuidv4(),
      email: 'devabdulbasid@gmail.com',
      password: hashedPassword,
      firstName: 'Abdulbasit',
      lastName: 'Alabi',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      lastLogin: new Date(),
      resetPasswordToken: null,
      resetPasswordExpires: null,
      totalScore: 0,
      streakCount: 0,
      completedProjects: 0,
      missedDeadlines: 0,
      avatar: null,
      bio: 'Platform Administrator and Lead Developer',
      githubUsername: null,
      linkedinUrl: null,
      emailNotifications: true,
      pushNotifications: true,
      permissions: {
        canCreateClasses: true,
        canManageStudents: true,
        canReviewSubmissions: true,
        canManageProjects: true,
        canViewAnalytics: true
      },
      metadata: {
        createdBy: 'system',
        source: 'script',
        notes: 'Primary admin user for the learning platform',
        country: 'Nigeria',
        timezone: 'Africa/Lagos'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if admin user already exists
    const existingAdmin = await sequelize.query(
      `SELECT id FROM "Users" WHERE email = :email`,
      {
        replacements: { email: adminUser.email },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️ Admin user already exists, updating...');
      
              // Update existing admin user
        await sequelize.query(
          `UPDATE "Users" SET 
            password = :password,
            "firstName" = :firstName,
            "lastName" = :lastName,
            role = :role,
            "emailVerified" = :emailVerified,
            "isActive" = :isActive,
            bio = :bio,
            "emailNotifications" = :emailNotifications,
            "pushNotifications" = :pushNotifications,
            permissions = :permissions,
            metadata = :metadata,
            "updatedAt" = :updatedAt
          WHERE email = :email`,
          {
            replacements: {
              password: adminUser.password,
              firstName: adminUser.firstName,
              lastName: adminUser.lastName,
              role: adminUser.role,
              emailVerified: adminUser.emailVerified,
              isActive: adminUser.isActive,
              bio: adminUser.bio,
              emailNotifications: adminUser.emailNotifications,
              pushNotifications: adminUser.pushNotifications,
              permissions: JSON.stringify(adminUser.permissions),
              metadata: JSON.stringify(adminUser.metadata),
              updatedAt: adminUser.updatedAt,
              email: adminUser.email
            }
          }
        );
      
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('📝 Creating new admin user...');
      
              // Insert new admin user
        await sequelize.query(
          `INSERT INTO "Users" (
            id, email, password, "firstName", "lastName", role, "emailVerified", 
            "isActive", bio, "emailNotifications", "pushNotifications", permissions, metadata, 
            "createdAt", "updatedAt"
          ) VALUES (
            :id, :email, :password, :firstName, :lastName, :role, :emailVerified,
            :isActive, :bio, :emailNotifications, :pushNotifications, :permissions, :metadata,
            :createdAt, :updatedAt
          )`,
          {
            replacements: {
              id: adminUser.id,
              email: adminUser.email,
              password: adminUser.password,
              firstName: adminUser.firstName,
              lastName: adminUser.lastName,
              role: adminUser.role,
              emailVerified: adminUser.emailVerified,
              isActive: adminUser.isActive,
              bio: adminUser.bio,
              emailNotifications: adminUser.emailNotifications,
              pushNotifications: adminUser.pushNotifications,
              permissions: JSON.stringify(adminUser.permissions),
              metadata: JSON.stringify(adminUser.metadata),
              createdAt: adminUser.createdAt,
              updatedAt: adminUser.updatedAt
            }
          }
        );
      
      console.log('✅ Admin user created successfully');
    }

    console.log('🎉 Admin user setup completed!');
    console.log('📧 Email: devabdulbasid@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('👨‍💼 Name: Abdulbasit Developer');
    console.log('🌍 Country: Nigeria');
    console.log('⏰ Timezone: Africa/Lagos');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
createAdminUser();
