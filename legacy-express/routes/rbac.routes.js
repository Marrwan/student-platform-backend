const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbac.controller');
const { auth } = require('../middleware/auth');
const { hasRole, hasPermission } = require('../middleware/has-permission.middleware');

// Protect all routes
router.use(auth);

// Roles Management - Requires Super Admin or 'user.manage_roles' permission
router.get('/roles', hasPermission('user.read', 'user.manage_roles'), rbacController.getRoles);
router.post('/roles', hasPermission('user.manage_roles'), rbacController.createRole);
router.put('/roles/:id', hasPermission('user.manage_roles'), rbacController.updateRole);
router.delete('/roles/:id', hasPermission('user.manage_roles'), rbacController.deleteRole);

// Permissions Management
router.get('/permissions', hasPermission('user.read', 'user.manage_roles'), rbacController.getPermissions);

// User Assignment
router.post('/users/assign-roles', hasPermission('user.manage_roles'), rbacController.assignRolesToUser);

module.exports = router;
