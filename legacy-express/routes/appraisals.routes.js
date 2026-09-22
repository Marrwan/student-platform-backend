const express = require('express');
const router = express.Router();
const appraisalController = require('../controllers/appraisals.controller');
const { auth } = require('../middleware/auth');
const { hasPermission, hasRole } = require('../middleware/has-permission.middleware');

// Cycles
router.post('/cycles', [auth, hasPermission('hrms.manage_appraisals')], appraisalController.createCycle);
router.get('/cycles', [auth, hasPermission('hrms.view_dashboard')], appraisalController.getAllCycles);

// Appraisals
router.post('/', [auth, hasRole('Staff', 'Admin', 'Super Admin')], appraisalController.initiateAppraisal);
router.get('/my', [auth, hasRole('Staff', 'Admin', 'Super Admin')], appraisalController.getMyAppraisals);
router.get('/:id', [auth, hasRole('Staff', 'Admin', 'Super Admin')], appraisalController.getAppraisalDetails);

// Objectives
router.post('/:appraisalId/objectives', [auth, hasRole('Staff', 'Admin', 'Super Admin')], appraisalController.addObjective);

// Key Results
router.post('/objectives/:objectiveId/key-results', [auth, hasRole('Staff', 'Admin', 'Super Admin')], appraisalController.addKeyResult);
router.put('/key-results/:id/score', [auth, hasRole('Staff', 'Admin', 'Super Admin')], appraisalController.updateKeyResultScore);

module.exports = router;
