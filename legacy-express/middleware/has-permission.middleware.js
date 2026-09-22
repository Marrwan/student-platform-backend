const { User, Role, Permission } = require('../models');

/**
 * Middleware to check if user has a specific permission
 * @param {...string} permissions - List of permission names (OR logic)
 */
const hasPermission = (...permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Re-fetch user with roles and permissions to ensure we have latest data
            // optimization: we could store this in the JWT or session, but for now we fetch
            // Ensure user roles and permissions are loaded
            // Optimization: Use reload to fetch associations on the existing user instance
            if (!req.user.roles || !req.user.userPermissions) {
                await req.user.reload({
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            include: [{ model: Permission, as: 'permissions' }]
                        },
                        {
                            model: Permission,
                            as: 'userPermissions'
                        }
                    ]
                });
            }

            const user = req.user;

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if user has any of the required permissions
            let hasAccess = false;

            // Check Super Admin role
            if (user.roles && user.roles.some(r => r.name === 'Super Admin')) {
                hasAccess = true;
            }

            // Check legacy admin role (backward compatibility)
            if (!hasAccess && user.role === 'admin') {
                hasAccess = true;
            }

            if (!hasAccess) {
                for (const permission of permissions) {
                    if (await user.hasPermissionTo(permission)) {
                        hasAccess = true;
                        break;
                    }
                }
            }

            if (!hasAccess) {
                return res.status(403).json({
                    message: 'Forbidden: You do not have the required permissions',
                    requiredPermissions: permissions
                });
            }

            // Attach full user object with roles/permissions to req
            req.user = user;
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

/**
 * Middleware to check if user has a specific role
 * @param {...string} roles - List of role names
 */
const hasRole = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const user = await User.findByPk(req.user.id, {
                include: [{ model: Role, as: 'roles' }]
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Super Admin bypass
            if (user.roles && user.roles.some(r => r.name === 'Super Admin')) {
                req.user = user;
                return next();
            }
            // Legacy admin bypass
            if (user.role === 'admin') {
                req.user = user;
                return next();
            }

            const hasRequiredRole = user.roles.some(r => roles.includes(r.name));

            // Legacy role check
            const hasLegacyRole = roles.includes(user.role);

            if (!hasRequiredRole && !hasLegacyRole) {
                return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

module.exports = {
    hasPermission,
    hasRole
};
