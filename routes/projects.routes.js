const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const projectsController = require('../controllers/projects.controller');

// Get all projects (filtered by user role and unlock status)
router.get('/', authenticateToken, projectsController.getAllProjects);

// Get single project by ID
router.get('/:id', authenticateToken, projectsController.getProjectById);

// Create new project (admin only)
router.post('/', authenticateToken, requireRole('admin'), projectsController.createProject);

// Update project (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), projectsController.updateProject);

// Toggle project lock status (admin only)
router.patch('/:id/lock', authenticateToken, requireRole('admin'), projectsController.toggleProjectLock);

// Delete project (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), projectsController.deleteProject);

// Get project statistics (admin only)
router.get('/:id/stats', authenticateToken, requireRole('admin'), projectsController.getProjectStats);

module.exports = router; 