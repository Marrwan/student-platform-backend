const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken, requireRole } = require('../middleware/auth');
const submissionsController = require('../controllers/submissions.controller');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.js', '.html', '.css'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only ZIP, JS, HTML, and CSS files are allowed.'));
    }
  }
});

// Submit project
router.post('/', authenticateToken, requireRole('user'), upload.single('file'), submissionsController.submitProject);

// Get user's submissions
router.get('/my', authenticateToken, requireRole('user'), submissionsController.getUserSubmissions);

// Get single submission
router.get('/:id', authenticateToken, submissionsController.getSubmissionById);

// Update submission (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), submissionsController.updateSubmission);

// Delete submission (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), submissionsController.deleteSubmission);

// Get submission statistics (admin only)
router.get('/stats/overview', authenticateToken, requireRole('admin'), submissionsController.getSubmissionStats);

// Get submissions by project (admin only)
router.get('/project/:projectId', authenticateToken, requireRole('admin'), submissionsController.getSubmissionsByProject);

module.exports = router; 