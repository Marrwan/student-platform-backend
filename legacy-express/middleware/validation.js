const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('requirements')
    .trim()
    .notEmpty()
    .withMessage('Requirements are required'),
  body('day')
    .isInt({ min: 1, max: 30 })
    .withMessage('Day must be between 1 and 30'),
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('maxScore')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max score must be between 1 and 1000'),
  handleValidationErrors
];

const submissionValidation = [
  body('githubLink')
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  body('codeSubmission')
    .optional()
    .isString()
    .withMessage('Code submission must be a string'),
  handleValidationErrors
];

const scoreValidation = [
  body('score')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Score must be between 0 and 1000'),
  body('adminFeedback')
    .optional()
    .isString()
    .withMessage('Admin feedback must be a string'),
  body('adminComments')
    .optional()
    .isString()
    .withMessage('Admin comments must be a string'),
  body('bonusPoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bonus points must be a positive integer'),
  body('deductions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Deductions must be a positive integer'),
  handleValidationErrors
];

const classValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Class name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max students must be between 1 and 1000'),
  handleValidationErrors
];

const assignmentValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('instructions')
    .optional()
    .isString()
    .withMessage('Instructions must be a string'),
  body('maxScore')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max score must be between 1 and 1000'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('submissionType')
    .optional()
    .isIn(['file', 'text', 'link', 'multiple'])
    .withMessage('Submission type must be file, text, link, or multiple'),
  handleValidationErrors
];

const challengeValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Challenge name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max participants must be between 1 and 10000'),
  handleValidationErrors
];

const profileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string'),
  body('githubUsername')
    .optional()
    .isString()
    .withMessage('GitHub username must be a string'),
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  projectValidation,
  submissionValidation,
  scoreValidation,
  classValidation,
  assignmentValidation,
  challengeValidation,
  profileValidation
}; 