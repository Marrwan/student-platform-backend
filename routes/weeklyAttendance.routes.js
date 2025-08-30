const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const weeklyAttendanceController = require('../controllers/weeklyAttendance.controller');

const router = express.Router();

// Get class weeks for attendance marking
router.get('/classes/:classId/weeks', authenticateToken, requireAdmin, weeklyAttendanceController.getClassWeeks);

// Get enrolled students for a class
router.get('/classes/:classId/students', authenticateToken, requireAdmin, weeklyAttendanceController.getEnrolledStudents);

// Mark weekly attendance for a single student
router.post('/classes/:classId/attendance', authenticateToken, requireAdmin, [
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('weekStartDate').isISO8601().withMessage('Valid week start date required'),
  body('attendance.monday').optional().isBoolean().withMessage('Monday must be boolean'),
  body('attendance.tuesday').optional().isBoolean().withMessage('Tuesday must be boolean'),
  body('attendance.wednesday').optional().isBoolean().withMessage('Wednesday must be boolean'),
  body('attendance.thursday').optional().isBoolean().withMessage('Thursday must be boolean'),
  body('attendance.friday').optional().isBoolean().withMessage('Friday must be boolean'),
  body('attendance.saturday').optional().isBoolean().withMessage('Saturday must be boolean'),
  body('attendance.sunday').optional().isBoolean().withMessage('Sunday must be boolean'),
  body('attendance.totalDaysInWeek').optional().isInt({ min: 1, max: 7 }).withMessage('Total days in week must be between 1 and 7'),
  body('attendance.score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('attendance.notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long')
], weeklyAttendanceController.markWeeklyAttendance);

// Mark weekly attendance for multiple students (bulk)
router.post('/classes/:classId/attendance/bulk', authenticateToken, requireAdmin, [
  body('weekStartDate').isISO8601().withMessage('Valid week start date required'),
  body('attendanceData').isArray({ min: 1 }).withMessage('Attendance data array required'),
  body('attendanceData.*.userId').isUUID().withMessage('Valid user ID required for each student'),
  body('attendanceData.*.attendance.monday').optional().isBoolean().withMessage('Monday must be boolean'),
  body('attendanceData.*.attendance.tuesday').optional().isBoolean().withMessage('Tuesday must be boolean'),
  body('attendanceData.*.attendance.wednesday').optional().isBoolean().withMessage('Wednesday must be boolean'),
  body('attendanceData.*.attendance.thursday').optional().isBoolean().withMessage('Thursday must be boolean'),
  body('attendanceData.*.attendance.friday').optional().isBoolean().withMessage('Friday must be boolean'),
  body('attendanceData.*.attendance.saturday').optional().isBoolean().withMessage('Saturday must be boolean'),
  body('attendanceData.*.attendance.sunday').optional().isBoolean().withMessage('Sunday must be boolean'),
  body('attendanceData.*.attendance.totalDaysInWeek').optional().isInt({ min: 1, max: 7 }).withMessage('Total days in week must be between 1 and 7'),
  body('attendanceData.*.attendance.score').optional().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('attendanceData.*.attendance.notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long')
], weeklyAttendanceController.markWeeklyAttendanceBulk);

// Get weekly attendance for a class
router.get('/classes/:classId/attendance', authenticateToken, requireAdmin, weeklyAttendanceController.getWeeklyAttendance);

// Get student's attendance history
router.get('/classes/:classId/students/:userId/attendance', authenticateToken, requireAdmin, weeklyAttendanceController.getStudentAttendanceHistory);

// Get class attendance summary
router.get('/classes/:classId/attendance/summary', authenticateToken, requireAdmin, weeklyAttendanceController.getClassAttendanceSummary);

module.exports = router;
