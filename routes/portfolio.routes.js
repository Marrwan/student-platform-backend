const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');
const { authenticateToken } = require('../middleware/auth');

// Public route (view portfolio by slug)
router.get('/public/:slug', portfolioController.getPublicPortfolio);

// Protected routes
router.use(authenticateToken);

// Portfolio Management
router.post('/', portfolioController.createPortfolio);
router.get('/', portfolioController.getPortfolio);
router.put('/', portfolioController.updatePortfolio);

// Project Management
router.post('/projects', portfolioController.addProject);
router.put('/projects/:id', portfolioController.updateProject);
router.delete('/projects/:id', portfolioController.deleteProject);

module.exports = router;
