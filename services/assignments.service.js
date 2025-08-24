const { User, Class, Assignment, AssignmentSubmission, ClassEnrollment, AttendanceScore, ClassLeaderboard, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');

class AssignmentsService {
  // Get all assignments (admin) or user's class assignments (student)
  async getAllAssignments(user, params) {
    try {
      const { page = 1, limit = 20, status, classId } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = {};
      if (status === 'active') whereClause.isActive = true;
      if (status === 'unlocked') whereClause.isUnlocked = true;
      if (classId) whereClause.classId = classId;

      if (user.role === 'student') {
        // Students see only assignments from their enrolled classes
        const enrollments = await ClassEnrollment.findAll({
          where: { userId: user.id },
          attributes: ['classId']
        });
        
        const classIds = enrollments.map(e => e.classId);
        whereClause.classId = { [Op.in]: classIds };
      }

      const includeArray = [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'enrollmentCode']
        }
      ];

      if (user.role === 'student') {
        includeArray.push({
          model: AssignmentSubmission,
          as: 'submissions',
          where: { userId: user.id },
          required: false
        });
      }

      const assignments = await Assignment.findAndCountAll({
        where: whereClause,
        include: includeArray,
        order: [['startDate', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // For students, add submission status and time info
      if (user.role === 'student') {
        assignments.rows = assignments.rows.map(assignment => {
          const assignmentData = assignment.toJSON();
          const submission = assignment.submissions?.[0];
          
          assignmentData.submissionStatus = submission ? submission.status : 'not_submitted';
          assignmentData.submissionScore = submission ? submission.score : null;
          assignmentData.isOverdue = assignment.isOverdue();
          assignmentData.timeRemaining = assignment.getTimeRemaining();
          assignmentData.canSubmit = assignment.canSubmit();
          
          return assignmentData;
        });
      }

      return {
        assignments: assignments.rows,
        total: assignments.count,
        page: parseInt(page),
        totalPages: Math.ceil(assignments.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  // Create new assignment (admin only)
  async createAssignment(assignmentData, userId, userRole) {
    try {
      const {
        title,
        description,
        classId,
        type = 'fullstack',
        difficulty = 'easy',
        maxScore = 100,
        startDate,
        deadline,
        requirements,
        sampleOutputUrl,
        sampleOutputCode,
        submissionMode = 'both',
        latePenalty = 10,
        allowLateSubmission = true,
        maxLateHours = 24,
        paymentRequired = false,
        paymentAmount = 500
      } = assignmentData;

      // Verify class exists and user has access
      const classData = await Class.findByPk(classId);
      if (!classData) {
        throw new Error('Class not found');
      }

      if (classData.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const assignment = await Assignment.create({
        title,
        description,
        classId,
        type,
        difficulty,
        maxScore,
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        requirements,
        sampleOutputUrl,
        sampleOutputCode,
        submissionMode,
        latePenalty,
        allowLateSubmission,
        maxLateHours,
        paymentRequired,
        paymentAmount
      });

      // Send notification emails to enrolled students
      const enrollments = await ClassEnrollment.findAll({
        where: { classId },
        include: [{ model: User, as: 'student', attributes: ['email', 'firstName', 'lastName'] }]
      });

      for (const enrollment of enrollments) {
        await sendEmail({
          to: enrollment.student.email,
          subject: `New Assignment: ${title}`,
          html: `
            <h2>New Assignment Available</h2>
            <p><strong>Class:</strong> ${classData.name}</p>
            <p><strong>Assignment:</strong> ${title}</p>
            <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
            <p><strong>Max Score:</strong> ${maxScore} points</p>
            <p>Log in to your dashboard to view the full assignment details and submit your work.</p>
          `
        });
      }

      return {
        message: 'Assignment created successfully',
        assignment
      };
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  // Get single assignment details
  async getAssignmentById(assignmentId, user) {
    try {
      const includeArray = [
        {
          model: Class,
          as: 'class',
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ];

      // Add submissions include only for students
      if (user.role === 'student') {
        includeArray.push({
          model: AssignmentSubmission,
          as: 'submissions',
          where: { userId: user.id },
          required: false
        });
      }

      const assignment = await Assignment.findByPk(assignmentId, {
        include: includeArray
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (user.role === 'student') {
        const enrollment = await ClassEnrollment.findOne({
          where: { classId: assignment.classId, userId: user.id }
        });
        
        if (!enrollment) {
          throw new Error('Access denied');
        }

        // Add submission info for students
        const assignmentData = assignment.toJSON();
        const submission = assignment.submissions?.[0];
        
        assignmentData.submissionStatus = submission ? submission.status : 'not_submitted';
        assignmentData.submissionScore = submission ? submission.score : null;
        assignmentData.isOverdue = assignment.isOverdue();
        assignmentData.timeRemaining = assignment.getTimeRemaining();
        assignmentData.canSubmit = assignment.canSubmit();
        
        return assignmentData;
      } else {
        // Admin users can access any assignment
        const assignmentData = assignment.toJSON();
        assignmentData.isOverdue = assignment.isOverdue();
        assignmentData.timeRemaining = assignment.getTimeRemaining();
        assignmentData.canSubmit = assignment.canSubmit();
        
        return assignmentData;
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  // Update assignment (admin only)
  async updateAssignment(assignmentId, updateData, userId, userRole) {
    try {
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      await assignment.update(updateData);

      return {
        message: 'Assignment updated successfully',
        assignment
      };
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  // Delete assignment (admin only)
  async deleteAssignment(assignmentId, userId, userRole) {
    try {
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      // Delete all related data in a transaction
      const { sequelize } = require('../models');
      await sequelize.transaction(async (t) => {
        // Delete all submissions for this assignment
        await AssignmentSubmission.destroy({
          where: { assignmentId },
          transaction: t
        });

        // Delete attendance scores related to this assignment (if any)
        await AttendanceScore.destroy({
          where: { 
            classId: assignment.classId,
            notes: { [sequelize.Op.like]: `%assignment:${assignmentId}%` }
          },
          transaction: t
        });

        // Update leaderboard entries to remove this assignment's contribution
        await ClassLeaderboard.update(
          {
            assignmentScore: sequelize.literal(`GREATEST(assignment_score - (
              SELECT COALESCE(SUM(score), 0) 
              FROM "AssignmentSubmissions" 
              WHERE "assignmentId" = '${assignmentId}' 
              AND "AssignmentSubmissions"."userId" = "ClassLeaderboards"."userId"
            ), 0)`)
          },
          {
            where: { classId: assignment.classId },
            transaction: t
          }
        );

        // Finally delete the assignment
        await assignment.destroy({ transaction: t });
      });

      return { message: 'Assignment and all related data deleted successfully' };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Submit assignment
  async submitAssignment(assignmentId, submissionData, user, file) {
    try {
      const { submissionType, githubLink, codeSubmission, submissionLink } = submissionData;

      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user is enrolled in the class
      const enrollment = await ClassEnrollment.findOne({
        where: { classId: assignment.classId, userId: user.id }
      });

      if (!enrollment) {
        throw new Error('Access denied');
      }

      // Check if assignment is unlocked and can be submitted
      if (!assignment.canSubmit()) {
        throw new Error('Assignment is not available for submission');
      }

      // Check if user has already submitted
      const existingSubmission = await AssignmentSubmission.findOne({
        where: { assignmentId, userId: user.id }
      });

      if (existingSubmission) {
        // Update existing submission
        await existingSubmission.destroy();
      }

      // Validate submission based on assignment submission mode
      if (assignment.submissionMode === 'code' && submissionType !== 'code') {
        throw new Error('This assignment only accepts code submissions');
      }

      if (assignment.submissionMode === 'link' && submissionType !== 'link') {
        throw new Error('This assignment only accepts link submissions');
      }

      // Validate submission based on type
      if (submissionType === 'github' && !githubLink) {
        throw new Error('GitHub link is required for GitHub submissions');
      }

      if (submissionType === 'code' && !codeSubmission) {
        throw new Error('Code submission is required for code submissions');
      }

      if (submissionType === 'link' && !submissionLink) {
        throw new Error('Submission link is required for link submissions');
      }

      if (submissionType === 'zip' && !file) {
        throw new Error('ZIP file is required for ZIP submissions');
      }

      // Create submission
      const submissionDataToSave = {
        assignmentId,
        userId: user.id,
        submissionType,
        submittedAt: new Date()
      };

      if (submissionType === 'github') {
        submissionDataToSave.githubLink = githubLink;
      } else if (submissionType === 'code') {
        submissionDataToSave.codeSubmission = codeSubmission;
      } else if (submissionType === 'link') {
        submissionDataToSave.submissionLink = submissionLink;
      } else if (submissionType === 'zip') {
        submissionDataToSave.zipFileUrl = file.path; // Store file path
      }

      // Check if submission is late
      const isLate = new Date() > assignment.deadline;
      if (isLate) {
        submissionDataToSave.isLate = true;
        submissionDataToSave.latePenalty = assignment.calculateLatePenalty(new Date());
        
        // If payment is required for late submissions
        if (assignment.paymentRequired) {
          submissionDataToSave.paymentStatus = 'pending';
          submissionDataToSave.paymentAmount = assignment.paymentAmount;
          submissionDataToSave.isBlocked = true;
          submissionDataToSave.blockReason = 'Late submission requires payment to regain access';
        }
      }

      const submission = await AssignmentSubmission.create(submissionDataToSave);

      // Update leaderboard
      await this.updateClassLeaderboard(assignment.classId, user.id);

      // Send notification email to instructor
      await sendEmail({
        to: assignment.class.instructor.email,
        subject: `New Assignment Submission: ${assignment.title}`,
        html: `
          <h2>New Assignment Submission</h2>
          <p><strong>Student:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
          <p><strong>Assignment:</strong> ${assignment.title}</p>
          <p><strong>Class:</strong> ${assignment.class.name}</p>
          <p><strong>Submission Type:</strong> ${submissionType}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          ${isLate ? `<p><strong>Status:</strong> Late submission (${submission.latePenalty} point penalty)</p>` : ''}
          ${submission.isBlocked ? `<p><strong>Payment Required:</strong> ₦${assignment.paymentAmount} to regain access</p>` : ''}
        `
      });

      return {
        message: 'Assignment submitted successfully',
        submission,
        isLate,
        requiresPayment: submission.isBlocked
      };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  // Get assignment submissions (admin only)
  async getAssignmentSubmissions(assignmentId, params, userId, userRole) {
    try {
      const { page = 1, limit = 20, status } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const whereClause = { assignmentId };
      if (status) whereClause.status = status;

      const submissions = await AssignmentSubmission.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['submittedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        submissions: submissions.rows,
        total: submissions.count,
        page: parseInt(page),
        totalPages: Math.ceil(submissions.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // Review submission (admin only)
  async reviewSubmission(assignmentId, submissionId, reviewData, userId, userRole) {
    try {
      const { status, score, adminFeedback, adminComments, bonusPoints = 0, deductions = 0 } = reviewData;

      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const submission = await AssignmentSubmission.findByPk(submissionId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!submission || submission.assignmentId !== assignmentId) {
        throw new Error('Submission not found');
      }

      // Calculate final score
      const finalScore = Math.max(0, (score || 0) + bonusPoints - deductions - submission.latePenalty);

      await submission.update({
        status,
        score: score || 0,
        adminFeedback,
        adminComments,
        bonusPoints,
        deductions,
        finalScore,
        reviewedBy: userId,
        reviewedAt: new Date()
      });

      // Send notification email to student
      await sendEmail({
        to: submission.user.email,
        subject: `Assignment Reviewed: ${assignment.title}`,
        html: `
          <h2>Assignment Review Complete</h2>
          <p><strong>Assignment:</strong> ${assignment.title}</p>
          <p><strong>Class:</strong> ${assignment.class.name}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Score:</strong> ${finalScore}/${assignment.maxScore}</p>
          ${adminFeedback ? `<p><strong>Feedback:</strong> ${adminFeedback}</p>` : ''}
          ${adminComments ? `<p><strong>Comments:</strong> ${adminComments}</p>` : ''}
          <p>Log in to your dashboard to view the full review.</p>
        `
      });

      return {
        message: 'Submission reviewed successfully',
        submission
      };
    } catch (error) {
      console.error('Error reviewing submission:', error);
      throw error;
    }
  }

  // Unlock assignment (admin only)
  async unlockAssignment(assignmentId, userId, userRole) {
    try {
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      await assignment.update({ isUnlocked: true });

      // Send notification emails to enrolled students
      const enrollments = await ClassEnrollment.findAll({
        where: { classId: assignment.classId },
        include: [{ model: User, as: 'student', attributes: ['email', 'firstName', 'lastName'] }]
      });

      for (const enrollment of enrollments) {
        await sendEmail({
          to: enrollment.student.email,
          subject: `Assignment Unlocked: ${assignment.title}`,
          html: `
            <h2>Assignment Now Available</h2>
            <p><strong>Class:</strong> ${assignment.class.name}</p>
            <p><strong>Assignment:</strong> ${assignment.title}</p>
            <p><strong>Deadline:</strong> ${assignment.deadline.toLocaleString()}</p>
            <p>The assignment is now unlocked and ready for submission!</p>
          `
        });
      }

      return {
        message: 'Assignment unlocked successfully',
        assignment
      };
    } catch (error) {
      console.error('Error unlocking assignment:', error);
      throw error;
    }
  }

  // Award attendance score (admin only)
  async awardAttendanceScore(classId, userId, score, notes, awardedBy) {
    try {
      const enrollment = await ClassEnrollment.findOne({
        where: { classId, userId }
      });

      if (!enrollment) {
        throw new Error('Student not enrolled in this class');
      }

      // Check if attendance score already exists for this date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingScore = await AttendanceScore.findOne({
        where: {
          classId,
          userId,
          attendanceDate: {
            [Op.gte]: today,
            [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingScore) {
        // Update existing score
        await existingScore.update({
          score,
          notes,
          awardedBy
        });
      } else {
        // Create new score
        await AttendanceScore.create({
          classId,
          userId,
          score,
          notes,
          awardedBy,
          attendanceDate: new Date()
        });
      }

      // Update leaderboard
      await this.updateClassLeaderboard(classId, userId);

      return {
        message: 'Attendance score awarded successfully'
      };
    } catch (error) {
      console.error('Error awarding attendance score:', error);
      throw error;
    }
  }

  // Get class leaderboard
  async getClassLeaderboard(classId, params = {}) {
    try {
      const { page = 1, limit = 20 } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const leaderboard = await ClassLeaderboard.findAndCountAll({
        where: { classId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['totalScore', 'DESC'], ['rank', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        leaderboard: leaderboard.rows,
        total: leaderboard.count,
        page: parseInt(page),
        totalPages: Math.ceil(leaderboard.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching class leaderboard:', error);
      throw error;
    }
  }

  // Update class leaderboard for a specific user
  async updateClassLeaderboard(classId, userId) {
    try {
      // Get all assignments for the class
      const assignments = await Assignment.findAll({
        where: { classId },
        attributes: ['id', 'maxScore']
      });

      // Get user's assignment submissions with status
      const submissions = await AssignmentSubmission.findAll({
        where: {
          assignmentId: { [Op.in]: assignments.map(a => a.id) },
          userId
        },
        attributes: ['assignmentId', 'finalScore', 'score', 'status']
      });

      // Calculate assignment score (only count accepted/reviewed submissions)
      const validSubmissions = submissions.filter(sub => 
        sub.status === 'accepted' || sub.status === 'reviewed' || sub.status === 'pending'
      );
      
      const assignmentScore = validSubmissions.reduce((total, submission) => {
        return total + (submission.finalScore || submission.score || 0);
      }, 0);

      // Get attendance scores
      const attendanceScores = await AttendanceScore.findAll({
        where: { classId, userId },
        attributes: ['score']
      });

      const attendanceScore = attendanceScores.reduce((total, score) => {
        return total + score.score;
      }, 0);

      const totalScore = assignmentScore + attendanceScore;

      // Get or create leaderboard entry
      let leaderboardEntry = await ClassLeaderboard.findOne({
        where: { classId, userId }
      });

      if (!leaderboardEntry) {
        leaderboardEntry = await ClassLeaderboard.create({
          classId,
          userId,
          totalScore: 0,
          assignmentScore: 0,
          attendanceScore: 0,
          assignmentsCompleted: 0,
          totalAssignments: assignments.length,
          attendanceCount: 0,
          totalSessions: 0,
          rank: 0
        });
      }

      // Update leaderboard entry
      await leaderboardEntry.update({
        totalScore,
        assignmentScore,
        attendanceScore,
        assignmentsCompleted: validSubmissions.length,
        totalAssignments: assignments.length,
        attendanceCount: attendanceScores.length,
        lastUpdated: new Date()
      });

      // Update ranks for all students in the class
      await this.updateClassRanks(classId);

      console.log(`Updated leaderboard for user ${userId} in class ${classId}: Total=${totalScore}, Assignments=${assignmentScore}, Attendance=${attendanceScore}`);

      return leaderboardEntry;
    } catch (error) {
      console.error('Error updating class leaderboard:', error);
      throw error;
    }
  }

  // Refresh all leaderboards for a class (admin only)
  async refreshClassLeaderboard(classId) {
    try {
      // Get all enrolled students
      const enrollments = await ClassEnrollment.findAll({
        where: { classId },
        include: [{ model: User, as: 'user', attributes: ['id'] }]
      });

      console.log(`Refreshing leaderboard for ${enrollments.length} students in class ${classId}`);

      // Update leaderboard for each student
      for (const enrollment of enrollments) {
        await this.updateClassLeaderboard(classId, enrollment.user.id);
      }

      return {
        message: `Leaderboard refreshed for ${enrollments.length} students`,
        studentCount: enrollments.length
      };
    } catch (error) {
      console.error('Error refreshing class leaderboard:', error);
      throw error;
    }
  }

  // Update ranks for all students in a class
  async updateClassRanks(classId) {
    try {
      const leaderboardEntries = await ClassLeaderboard.findAll({
        where: { classId },
        order: [['totalScore', 'DESC'], ['lastUpdated', 'ASC']] // Secondary sort by last updated for tie-breaking
      });

      // Update ranks in a single transaction for better performance
      const { sequelize } = require('../models');
      await sequelize.transaction(async (t) => {
        for (let i = 0; i < leaderboardEntries.length; i++) {
          await leaderboardEntries[i].update({ 
            rank: i + 1,
            lastUpdated: new Date()
          }, { transaction: t });
        }
      });

      console.log(`Updated ranks for ${leaderboardEntries.length} students in class ${classId}`);
    } catch (error) {
      console.error('Error updating class ranks:', error);
      throw error;
    }
  }

  // Get all submissions for an assignment (admin only)
  async getAssignmentSubmissions(assignmentId, userId, userRole) {
    try {
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{ model: Class, as: 'class' }]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access
      if (assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const submissions = await AssignmentSubmission.findAll({
        where: { assignmentId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['submittedAt', 'DESC']]
      });

      return {
        submissions,
        total: submissions.length,
        assignment: {
          id: assignment.id,
          title: assignment.title,
          maxScore: assignment.maxScore,
          deadline: assignment.deadline
        }
      };
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      throw error;
    }
  }

  // Mark/Review a submission (admin only)
  async markSubmission(submissionId, reviewData, userId, userRole) {
    try {
      const submission = await AssignmentSubmission.findByPk(submissionId, {
        include: [
          {
            model: Assignment,
            as: 'assignment',
            include: [{ model: Class, as: 'class' }]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Check if user has access
      if (submission.assignment.class.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const { score, feedback, status = 'reviewed' } = reviewData;

      // Validate score
      if (score !== undefined && (score < 0 || score > submission.assignment.maxScore)) {
        throw new Error(`Score must be between 0 and ${submission.assignment.maxScore}`);
      }

      // Update submission
      await submission.update({
        score: score !== undefined ? score : submission.score,
        feedback: feedback !== undefined ? feedback : submission.feedback,
        status,
        reviewedAt: new Date(),
        reviewedBy: userId
      });

      // Update leaderboard for the student
      await this.updateClassLeaderboard(submission.assignment.classId, submission.userId);

      // Send notification to student
      try {
        await sendEmail({
          to: submission.user.email,
          subject: `Assignment Reviewed: ${submission.assignment.title}`,
          html: `
            <h2>Your Assignment Has Been Reviewed</h2>
            <p><strong>Assignment:</strong> ${submission.assignment.title}</p>
            <p><strong>Score:</strong> ${score || submission.score}/${submission.assignment.maxScore}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            <p>Log in to your dashboard to view the full review.</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending review notification:', emailError);
      }

      return {
        message: 'Submission marked successfully',
        submission
      };
    } catch (error) {
      console.error('Error marking submission:', error);
      throw error;
    }
  }

  // Check if user is blocked from accessing the platform
  async checkUserBlockStatus(userId) {
    try {
      const overdueSubmissions = await AssignmentSubmission.findAll({
        where: {
          userId,
          isLate: true,
          paymentStatus: 'pending'
        },
        include: [
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['title', 'paymentAmount']
          }
        ]
      });

      if (overdueSubmissions.length === 0) {
        return { isBlocked: false, reason: null, totalAmount: 0 };
      }

      const totalAmount = overdueSubmissions.reduce((total, submission) => {
        return total + (submission.assignment.paymentAmount || 500);
      }, 0);

      return {
        isBlocked: true,
        reason: `You have ${overdueSubmissions.length} overdue assignment(s) that require payment to regain access.`,
        totalAmount,
        overdueSubmissions: overdueSubmissions.map(s => ({
          id: s.id,
          assignmentTitle: s.assignment.title,
          amount: s.assignment.paymentAmount || 500
        }))
      };
    } catch (error) {
      console.error('Error checking user block status:', error);
      throw error;
    }
  }

  // Process payment for overdue assignments
  async processOverduePayment(userId, paymentReference, amount) {
    try {
      const overdueSubmissions = await AssignmentSubmission.findAll({
        where: {
          userId,
          isLate: true,
          paymentStatus: 'pending'
        }
      });

      if (overdueSubmissions.length === 0) {
        throw new Error('No overdue submissions found');
      }

      // Update all overdue submissions as paid
      await AssignmentSubmission.update(
        {
          paymentStatus: 'paid',
          paymentReference,
          paymentAmount: amount / overdueSubmissions.length,
          isBlocked: false
        },
        {
          where: {
            userId,
            isLate: true,
            paymentStatus: 'pending'
          }
        }
      );

      return {
        message: 'Payment processed successfully',
        submissionsUpdated: overdueSubmissions.length
      };
    } catch (error) {
      console.error('Error processing overdue payment:', error);
      throw error;
    }
  }
}

module.exports = new AssignmentsService(); 