const { Op } = require('sequelize');
const { WeeklyAttendance, Class, User, ClassEnrollment } = require('../models');
const { sendEmail } = require('../utils/email');

class WeeklyAttendanceService {
  // Get week start and end dates for a given date
  getWeekRange(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return {
      start: weekStart.toISOString().split('T')[0], // YYYY-MM-DD format
      end: weekEnd.toISOString().split('T')[0]
    };
  }

  // Get all weeks for a class duration
  getClassWeeks(classId) {
    return Class.findByPk(classId).then(classData => {
      if (!classData) {
        throw new Error('Class not found');
      }

      const weeks = [];
      const startDate = new Date(classData.startDate);
      const endDate = new Date(classData.endDate);
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const weekRange = this.getWeekRange(currentDate);
        weeks.push({
          weekStart: weekRange.start,
          weekEnd: weekRange.end,
          label: `Week of ${new Date(weekRange.start).toLocaleDateString()}`
        });
        
        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
      
      return weeks;
    });
  }

  // Mark weekly attendance for a student
  async markWeeklyAttendance(classId, userId, weekStartDate, attendanceData, markedBy) {
    try {
      // Check if student is enrolled
      const enrollment = await ClassEnrollment.findOne({
        where: { classId, userId }
      });

      if (!enrollment) {
        throw new Error('Student not enrolled in this class');
      }

      // Get week range
      const weekRange = this.getWeekRange(weekStartDate);
      
      // Check if attendance already exists for this week
      let weeklyAttendance = await WeeklyAttendance.findOne({
        where: {
          classId,
          userId,
          weekStartDate: weekRange.start
        }
      });

      const attendanceFields = {
        monday: attendanceData.monday || false,
        tuesday: attendanceData.tuesday || false,
        wednesday: attendanceData.wednesday || false,
        thursday: attendanceData.thursday || false,
        friday: attendanceData.friday || false,
        saturday: attendanceData.saturday || false,
        sunday: attendanceData.sunday || false,
        totalDaysInWeek: attendanceData.totalDaysInWeek || 5,
        score: attendanceData.score || 0,
        notes: attendanceData.notes || '',
        markedBy,
        markedAt: new Date()
      };

      if (weeklyAttendance) {
        // Update existing attendance
        await weeklyAttendance.update(attendanceFields);
      } else {
        // Create new attendance
        weeklyAttendance = await WeeklyAttendance.create({
          classId,
          userId,
          weekStartDate: weekRange.start,
          weekEndDate: weekRange.end,
          ...attendanceFields
        });
      }

      // Calculate attendance percentage
      weeklyAttendance.calculateAttendance();
      await weeklyAttendance.save();

      return {
        message: 'Weekly attendance marked successfully',
        attendance: weeklyAttendance
      };
    } catch (error) {
      console.error('Error marking weekly attendance:', error);
      throw error;
    }
  }

  // Mark weekly attendance for multiple students
  async markWeeklyAttendanceBulk(classId, weekStartDate, attendanceData, markedBy) {
    try {
      const results = [];
      const errors = [];

      for (const studentAttendance of attendanceData) {
        try {
          const result = await this.markWeeklyAttendance(
            classId,
            studentAttendance.userId,
            weekStartDate,
            studentAttendance.attendance,
            markedBy
          );
          results.push(result);
        } catch (error) {
          errors.push({
            userId: studentAttendance.userId,
            error: error.message
          });
        }
      }

      return {
        message: `Weekly attendance marked for ${results.length} students`,
        results,
        errors
      };
    } catch (error) {
      console.error('Error marking bulk weekly attendance:', error);
      throw error;
    }
  }

  // Get weekly attendance for a class
  async getWeeklyAttendance(classId, weekStartDate) {
    try {
      const weekRange = this.getWeekRange(weekStartDate);
      
      const attendance = await WeeklyAttendance.findAll({
        where: {
          classId,
          weekStartDate: weekRange.start
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'markedByUser',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return {
        weekStart: weekRange.start,
        weekEnd: weekRange.end,
        attendance
      };
    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
      throw error;
    }
  }

  // Get student's attendance history
  async getStudentAttendanceHistory(classId, userId) {
    try {
      const attendance = await WeeklyAttendance.findAll({
        where: {
          classId,
          userId
        },
        include: [
          {
            model: User,
            as: 'markedByUser',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['weekStartDate', 'DESC']]
      });

      return attendance;
    } catch (error) {
      console.error('Error fetching student attendance history:', error);
      throw error;
    }
  }

  // Get class attendance summary
  async getClassAttendanceSummary(classId) {
    try {
      const summary = await WeeklyAttendance.findAll({
        where: { classId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['weekStartDate', 'DESC']]
      });

      // Group by student and calculate totals
      const studentSummary = {};
      
      summary.forEach(record => {
        const userId = record.userId;
        if (!studentSummary[userId]) {
          studentSummary[userId] = {
            user: record.user,
            totalWeeks: 0,
            totalDaysPresent: 0,
            totalDaysExpected: 0,
            averagePercentage: 0,
            totalScore: 0
          };
        }
        
        studentSummary[userId].totalWeeks++;
        studentSummary[userId].totalDaysPresent += record.totalDaysPresent;
        studentSummary[userId].totalDaysExpected += record.totalDaysInWeek;
        studentSummary[userId].totalScore += parseFloat(record.score);
      });

      // Calculate averages
      Object.values(studentSummary).forEach(student => {
        student.averagePercentage = student.totalDaysExpected > 0 
          ? (student.totalDaysPresent / student.totalDaysExpected) * 100 
          : 0;
        student.averageScore = student.totalWeeks > 0 
          ? student.totalScore / student.totalWeeks 
          : 0;
      });

      return Object.values(studentSummary);
    } catch (error) {
      console.error('Error fetching class attendance summary:', error);
      throw error;
    }
  }

  // Get students enrolled in a class (for attendance marking)
  async getEnrolledStudents(classId) {
    try {
      const enrollments = await ClassEnrollment.findAll({
        where: { classId },
        attributes: ['userId'],
        order: [['createdAt', 'ASC']]
      });

      const userIds = enrollments.map(enrollment => enrollment.userId);
      
      if (userIds.length === 0) {
        return [];
      }

      const students = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'firstName', 'lastName', 'email'],
        order: [['firstName', 'ASC']]
      });

      return students;
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      throw error;
    }
  }
}

module.exports = new WeeklyAttendanceService();

