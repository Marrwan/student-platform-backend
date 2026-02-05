const express = require('express');
const router = express.Router();
const appraisalController = require('../controllers/appraisals.controller');
const { auth, isAdmin, isStaff } = require('../middleware/auth.middleware');

// Cycles
router.post('/cycles', [auth, isAdmin], appraisalController.createCycle);
router.get('/cycles', [auth, isStaff], appraisalController.getAllCycles);

// Appraisals
router.post('/', [auth, isStaff], appraisalController.initiateAppraisal); // Admin or Supervisor or Self?
router.get('/my', [auth, isStaff], appraisalController.getMyAppraisals);
router.get('/:id', [auth, isStaff], appraisalController.getAppraisalDetails);

// Objectives
router.post('/:appraisalId/objectives', [auth, isStaff], appraisalController.addObjective);

// Key Results
router.post('/objectives/:objectiveId/key-results', [auth, isStaff], appraisalController.addKeyResult);
router.put('/key-results/:id/score', [auth, isStaff], appraisalController.updateKeyResultScore);

module.exports = router;
