'use strict';
const { v4: uuidv4 } = require('uuid');

const permissions = [
  // User Management
  { name: 'user.create', description: 'Can create new users', group: 'User Management' },
  { name: 'user.read', description: 'Can view user details', group: 'User Management' },
  { name: 'user.update', description: 'Can update user details', group: 'User Management' },
  { name: 'user.delete', description: 'Can delete users', group: 'User Management' },
  { name: 'user.manage_roles', description: 'Can assign roles to users', group: 'User Management' },

  // Class Management
  { name: 'class.create', description: 'Can create new classes', group: 'Class Management' },
  { name: 'class.read', description: 'Can view classes', group: 'Class Management' },
  { name: 'class.update', description: 'Can update class details', group: 'Class Management' },
  { name: 'class.delete', description: 'Can delete classes', group: 'Class Management' },
  { name: 'class.enroll_student', description: 'Can enroll students in classes', group: 'Class Management' },

  // Assignment Management
  { name: 'assignment.create', description: 'Can create assignments', group: 'Assignment Management' },
  { name: 'assignment.read', description: 'Can view assignments', group: 'Assignment Management' },
  { name: 'assignment.update', description: 'Can update assignments', group: 'Assignment Management' },
  { name: 'assignment.delete', description: 'Can delete assignments', group: 'Assignment Management' },
  { name: 'assignment.grade', description: 'Can grade assignments', group: 'Assignment Management' },

  // HRMS
  { name: 'hrms.view_dashboard', description: 'Can view HRMS dashboard', group: 'HRMS' },
  { name: 'hrms.manage_employees', description: 'Can manage employees', group: 'HRMS' },
  { name: 'hrms.manage_departments', description: 'Can manage departments', group: 'HRMS' },
  { name: 'hrms.manage_appraisals', description: 'Can manage appraisals', group: 'HRMS' },
  { name: 'hrms.manage_payroll', description: 'Can manage payroll', group: 'HRMS' },

  // Analytics
  { name: 'analytics.view_global', description: 'Can view global analytics', group: 'Analytics' },
  { name: 'analytics.view_class', description: 'Can view class analytics', group: 'Analytics' },

  // Content
  { name: 'content.manage', description: 'Can manage platform content', group: 'Content' }
];

const roles = [
  {
    name: 'Super Admin',
    description: 'Has full access to everything',
    isDefault: false,
    permissions: permissions.map(p => p.name) // All permissions
  },
  {
    name: 'Admin',
    description: 'Administrative access for most platform features',
    isDefault: false,
    permissions: [
      'user.create', 'user.read', 'user.update',
      'class.create', 'class.read', 'class.update', 'class.enroll_student',
      'assignment.create', 'assignment.read', 'assignment.update', 'assignment.grade',
      'analytics.view_global', 'analytics.view_class',
      'content.manage'
    ]
  },
  {
    name: 'Staff',
    description: 'Internal staff/employees with HRMS access',
    isDefault: false,
    permissions: [
      'hrms.view_dashboard',
      'class.read',
      'assignment.read'
    ]
  },
  {
    name: 'Student',
    description: 'Standard student access',
    isDefault: true,
    permissions: [
      'class.read',
      'assignment.read'
    ]
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Insert Permissions
      const permissionRecords = [];
      for (const perm of permissions) {
        const existing = await queryInterface.rawSelect('Permissions', {
          where: { name: perm.name },
        }, ['id']);

        if (!existing) {
          permissionRecords.push({
            id: uuidv4(),
            name: perm.name,
            description: perm.description,
            group: perm.group,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (permissionRecords.length > 0) {
        await queryInterface.bulkInsert('Permissions', permissionRecords, { transaction });
      }

      // Fetch all permissions to map names to IDs
      const allPermissions = await queryInterface.sequelize.query(
        'SELECT id, name FROM "Permissions";',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      const permMap = allPermissions.reduce((acc, p) => ({ ...acc, [p.name]: p.id }), {});

      // 2. Insert Roles and RolePermissions
      for (const roleDef of roles) {
        let roleId;
        const existingRole = await queryInterface.rawSelect('Roles', {
          where: { name: roleDef.name },
        }, ['id']);

        if (existingRole) {
          roleId = existingRole;
        } else {
          roleId = uuidv4();
          await queryInterface.bulkInsert('Roles', [{
            id: roleId,
            name: roleDef.name,
            description: roleDef.description,
            isDefault: roleDef.isDefault,
            createdAt: new Date(),
            updatedAt: new Date()
          }], { transaction });
        }

        // Assign permissions to role
        if (roleDef.permissions && roleDef.permissions.length > 0) {
          const rolePermissions = roleDef.permissions
            .map(pName => permMap[pName])
            .filter(id => id) // Filter out undefined if permission missing
            .map(permId => ({
              id: uuidv4(),
              roleId: roleId,
              permissionId: permId,
              createdAt: new Date(),
              updatedAt: new Date()
            }));

          // Avoid duplicates - delete existing assignments for this role first (optional, but safer for re-runs)
          // Simplified: just insert ignore or fetch existing logic is hard in raw SQL within migration
          // For now, let's just insert new ones that don't violate unique constraint
          // Or since we have a unique constraint, we can use ignoreDuplicates option in bulkInsert but Sequelize doesn't support it well across DBs
          // Instead, we'll confirm later. For now assuming fresh seed or careful re-seed.

          for (const rp of rolePermissions) {
            const exists = await queryInterface.rawSelect('RolePermission', {
              where: { roleId: rp.roleId, permissionId: rp.permissionId }
            }, ['id']);

            if (!exists) {
              await queryInterface.bulkInsert('RolePermission', [rp], { transaction });
            }
          }
        }
      }

      // 3. Migrate Existing Users
      // Map old 'role' string to new Roles
      const roleMap = {};
      const allRoles = await queryInterface.sequelize.query(
        'SELECT id, name FROM "Roles";',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      allRoles.forEach(r => roleMap[r.name] = r.id);

      const roleMapping = {
        'admin': roleMap['Super Admin'], // Existing admins become Super Admins
        'staff': roleMap['Staff'],  // Staff users get Staff role
        'student': roleMap['Student']
      };

      const users = await queryInterface.sequelize.query(
        'SELECT id, role FROM "Users";',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      for (const user of users) {
        const newRoleId = roleMapping[user.role];
        if (newRoleId) {
          const exists = await queryInterface.rawSelect('UserRole', {
            where: { userId: user.id, roleId: newRoleId }
          }, ['id']);

          if (!exists) {
            await queryInterface.bulkInsert('UserRole', [{
              id: uuidv4(),
              userId: user.id,
              roleId: newRoleId,
              createdAt: new Date(),
              updatedAt: new Date()
            }], { transaction });
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // We typically don't delete data in down migrations for seeders unless we want to clear everything
    // But for a migration, we should revert. This is a Seeder though.
    // Usually seeders are not reverted.
  }
};
