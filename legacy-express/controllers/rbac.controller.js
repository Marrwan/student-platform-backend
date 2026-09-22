const { Role, Permission, User, RolePermission, UserRole, UserPermission, sequelize } = require('../models');

class RBACController {
    // --- ROLES ---

    // Get all roles
    async getRoles(req, res) {
        try {
            const roles = await Role.findAll({
                include: [{
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] } // Hide junction table
                }],
                order: [['name', 'ASC']]
            });
            res.json({ success: true, roles });
        } catch (error) {
            console.error('Get roles error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch roles' });
        }
    }

    // Create role
    async createRole(req, res) {
        const t = await sequelize.transaction();
        try {
            const { name, description, permissions } = req.body;

            if (!name) {
                return res.status(400).json({ success: false, message: 'Role name is required' });
            }

            const role = await Role.create({ name, description }, { transaction: t });

            if (permissions && Array.isArray(permissions)) {
                const perms = await Permission.findAll({
                    where: { name: permissions },
                    transaction: t
                });
                await role.setPermissions(perms, { transaction: t });
            }

            await t.commit();

            // Fetch with permissions
            const createdRole = await Role.findByPk(role.id, {
                include: [{ model: Permission, as: 'permissions' }]
            });

            res.status(201).json({ success: true, role: createdRole });
        } catch (error) {
            await t.rollback();
            console.error('Create role error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Update role
    async updateRole(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { name, description, permissions } = req.body;

            const role = await Role.findByPk(id);
            if (!role) {
                return res.status(404).json({ success: false, message: 'Role not found' });
            }

            if (role.name === 'Super Admin' && name !== 'Super Admin') {
                // Prevent renaming super admin to avoid lockouts if logic depends on name
                // Though ID is better to rely on, name is often used in code
            }

            await role.update({ name, description }, { transaction: t });

            if (permissions && Array.isArray(permissions)) {
                const perms = await Permission.findAll({
                    where: { name: permissions },
                    transaction: t
                });
                await role.setPermissions(perms, { transaction: t });
            }

            await t.commit();

            const updatedRole = await Role.findByPk(id, {
                include: [{ model: Permission, as: 'permissions' }]
            });

            res.json({ success: true, role: updatedRole });
        } catch (error) {
            await t.rollback();
            console.error('Update role error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Delete role
    async deleteRole(req, res) {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id);

            if (!role) {
                return res.status(404).json({ success: false, message: 'Role not found' });
            }

            if (role.isDefault) {
                return res.status(400).json({ success: false, message: 'Cannot delete default role' });
            }

            if (role.name === 'Super Admin') {
                return res.status(400).json({ success: false, message: 'Cannot delete Super Admin role' });
            }

            await role.destroy();
            res.json({ success: true, message: 'Role deleted successfully' });
        } catch (error) {
            console.error('Delete role error:', error);
            res.status(500).json({ success: false, message: 'Failed to delete role' });
        }
    }

    // --- PERMISSIONS ---

    // Get all permissions
    async getPermissions(req, res) {
        try {
            const permissions = await Permission.findAll({
                order: [['group', 'ASC'], ['name', 'ASC']]
            });
            res.json({ success: true, permissions });
        } catch (error) {
            console.error('Get permissions error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
        }
    }

    // --- USER ASSIGNMENT ---

    // Assign roles to user
    async assignRolesToUser(req, res) {
        const t = await sequelize.transaction();
        try {
            const { userId, roles } = req.body; // roles = array of role names or IDs

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            let roleInstances;
            // Check if IDs or Names (simple heuristic: if uuid, assume ID)
            // For simplicity, let's assume names for now as frontend usually sends names, or handle both

            const roleQuery = Array.isArray(roles) ? { name: roles } : { name: [roles] };
            roleInstances = await Role.findAll({ where: roleQuery, transaction: t });

            await user.setRoles(roleInstances, { transaction: t });

            await t.commit();
            res.json({ success: true, message: 'Roles assigned successfully' });
        } catch (error) {
            await t.rollback();
            console.error('Assign roles error:', error);
            res.status(500).json({ success: false, message: 'Failed to assign roles' });
        }
    }
}

module.exports = new RBACController();
