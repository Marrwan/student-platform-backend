const { validationResult } = require('express-validator');
const weeklyAttendanceService = require('../services/weeklyAttendance.service');

class WeeklyAttendanceController {
  // Get class weeks for attendance marking
  async getClassWeeks(req, res) {
    try {
      const { classId } = req.params;
      const weeks = await weeklyAttendanceService.getClassWeeks(classId);
      
      res.json({ weeks });
    } catch (error) {
      console.error('Error in getClassWeeks controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get enrolled students for a class
  async getEnrolledStudents(req, res) {
    try {
      const { classId } = req.params;
      const students = await weeklyAttendanceService.getEnrolledStudents(classId);
      
      res.json({ students });
    } catch (error) {
      console.error('Error in getEnrolledStudents controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Mark weekly attendance for a single student
  async markWeeklyAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { classId } = req.params;
      const { userId, weekStartDate, attendance } = req.body;
      
      const result = await weeklyAttendanceService.markWeeklyAttendance(
        classId,
        userId,
        weekStartDate,
        attendance,
        req.user.id
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error in markWeeklyAttendance controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Mark weekly attendance for multiple students (bulk)
  async markWeeklyAttendanceBulk(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { classId } = req.params;
      const { weekStartDate, attendanceData } = req.body;
      
      const result = await weeklyAttendanceService.markWeeklyAttendanceBulk(
        classId,
        weekStartDate,
        attendanceData,
        req.user.id
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error in markWeeklyAttendanceBulk controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get weekly attendance for a class
  async getWeeklyAttendance(req, res) {
    try {
      const { classId } = req.params;
      const { weekStartDate } = req.query;
      
      const attendance = await weeklyAttendanceService.getWeeklyAttendance(
        classId,
        weekStartDate || new Date()
      );
      
      res.json(attendance);
    } catch (error) {
      console.error('Error in getWeeklyAttendance controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get student's attendance history
  async getStudentAttendanceHistory(req, res) {
    try {
      const { classId, userId } = req.params;
      
      const attendance = await weeklyAttendanceService.getStudentAttendanceHistory(
        classId,
        userId
      );
      
      res.json({ attendance });
    } catch (error) {
      console.error('Error in getStudentAttendanceHistory controller:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get class attendance summary
  async getClassAttendanceSummary(req, res) {
    try {
      const { classId } = req.params;
      
      const summary = await weeklyAttendanceService.getClassAttendanceSummary(classId);
      
      res.json({ summary });
    } catch (error) {
      console.error('Error in getClassAttendanceSummary controller:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new WeeklyAttendanceController();
