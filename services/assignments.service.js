const { User, Class, Assignment, AssignmentSubmission, ClassEnrollment, AttendanceScore, ClassLeaderboard, WeeklyAttendance, sequelize, Payment } = require('../models');
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
      if (classId) whereClause.classId = classId;

      if (user.role === 'student') {
        // Students see ALL assignments from their enrolled classes (not just unlocked ones)
        const enrollments = await ClassEnrollment.findAll({
          where: { userId: user.id },
          attributes: ['classId']
        });

        const classIds = enrollments.map(e => e.classId);
        whereClause.classId = { [Op.in]: classIds };
        // Remove the isUnlocked filter - students can see all assignments
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

          // Add model methods to the response
          assignmentData.isOverdue = assignment.isOverdue();
          assignmentData.timeRemaining = assignment.getTimeRemaining();
          assignmentData.canSubmit = assignment.canSubmit();
          assignmentData.getStatus = assignment.getStatus();
          assignmentData.isAvailable = assignment.isAvailable();

          assignmentData.submissionStatus = submission ? submission.status : 'not_submitted';
          assignmentData.submissionScore = submission ? submission.score : null;
          assignmentData.hasSubmission = !!submission;

          return assignmentData;
        });
      } else {
        // For admins, also add the model methods
        assignments.rows = assignments.rows.map(assignment => {
          const assignmentData = assignment.toJSON();
          assignmentData.isOverdue = assignment.isOverdue();
          assignmentData.timeRemaining = assignment.getTimeRemaining();
          assignmentData.canSubmit = assignment.canSubmit();
          assignmentData.getStatus = assignment.getStatus();
          assignmentData.isAvailable = assignment.isAvailable();
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
        paymentAmount,
        isUnlocked: true, // Automatically unlock assignments when created
        isActive: true
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

  // Get assignment by ID
  async getAssignmentById(assignmentId, userId, userRole) {
    try {
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [
          {
            model: Class,
            as: 'class',
            include: [{
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }]
          }
        ]
      });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check if user has access to this assignment
      if (userRole === 'student') {
        const enrollment = await ClassEnrollment.findOne({
          where: { classId: assignment.classId, userId }
        });

        if (!enrollment) {
          throw new Error('Access denied');
        }
      }

      return assignment;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  // Get my submission for an assignment
  async getMySubmission(assignmentId, userId) {
    try {
      const submission = await AssignmentSubmission.findOne({
        where: { assignmentId, userId },
        include: [
          {
            model: Assignment,
            as: 'assignment',
            include: [{ model: Class, as: 'class' }]
          }
        ]
      });

      // Return null submission if not found (this is normal for new students)
      // Check if user has paid for this assignment (via late fee)
      let hasPaid = false;
      if (submission && submission.paymentStatus === 'paid') {
        hasPaid = true;
      } else {
        // Check Payment table for successful late fee payment
        const payment = await Payment.findOne({
          where: {
            userId,
            status: 'success',
            metadata: {
              assignmentId: assignmentId
            }
          }
        });
        if (payment) hasPaid = true;
      }

      return {
        submission: submission || null,
        hasPaid
      };
    } catch (error) {
      console.error('Error fetching my submission:', error);
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

  // Delete submission (admin or owner)
  async deleteSubmission(assignmentId, submissionId, user) {
    try {
      const submission = await AssignmentSubmission.findByPk(submissionId);

      if (!submission) {
        throw new Error('Submission not found');
      }

      if (submission.assignmentId !== assignmentId) {
        throw new Error('Submission does not belong to this assignment');
      }

      // Authorization check: User must be admin or the owner of the submission
      const isAdmin = user.role === 'admin' || user.role === 'partial_admin';
      const isOwner = submission.userId === user.id;

      if (!isAdmin && !isOwner) {
        throw new Error('Access denied. You can only delete your own submissions.');
      }

      await submission.destroy();

      return { message: 'Submission deleted successfully' };
    } catch (error) {
      console.error('Error deleting submission:', error);
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
            notes: { [Op.like]: `%assignment:${assignmentId}%` }
          },
          transaction: t
        });

        // Get all leaderboard entries for this class and recalculate them
        const leaderboardEntries = await ClassLeaderboard.findAll({
          where: { classId: assignment.classId },
          transaction: t
        });

        // Recalculate leaderboard scores for each user
        for (const entry of leaderboardEntries) {
          // Get user's remaining submissions (excluding the deleted assignment)
          const remainingSubmissions = await AssignmentSubmission.findAll({
            where: {
              userId: entry.userId,
              assignmentId: { [Op.ne]: assignmentId }
            },
            transaction: t
          });

          // Calculate new assignment score
          const newAssignmentScore = remainingSubmissions.reduce((total, submission) => {
            const score = parseFloat(submission.finalScore) || parseFloat(submission.score) || 0;
            return total + score;
          }, 0);

          // Get attendance scores
          const attendanceScores = await AttendanceScore.findAll({
            where: { classId: assignment.classId, userId: entry.userId },
            transaction: t
          });

          const attendanceScore = attendanceScores.reduce((total, score) => {
            return total + (parseFloat(score.score) || 0);
          }, 0);

          const totalScore = newAssignmentScore + attendanceScore;

          // Update leaderboard entry
          await entry.update({
            assignmentScore: newAssignmentScore,
            totalScore: totalScore,
            assignmentsCompleted: remainingSubmissions.length,
            lastUpdated: new Date()
          }, { transaction: t });
        }

        // Update ranks after recalculating scores
        const updatedLeaderboardEntries = await ClassLeaderboard.findAll({
          where: { classId: assignment.classId },
          order: [['totalScore', 'DESC'], ['lastUpdated', 'ASC']],
          transaction: t
        });

        for (let i = 0; i < updatedLeaderboardEntries.length; i++) {
          await updatedLeaderboardEntries[i].update({
            rank: i + 1
          }, { transaction: t });
        }

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
      let { submissionType, githubLink, codeSubmission, submissionLink } = submissionData;

      // Debug logging
      console.log('Submission data received:', {
        submissionType,
        githubLink,
        submissionLink,
        hasCodeSubmission: !!codeSubmission,
        hasFile: !!file,
        fileOriginalName: file?.originalname
      });

      // Parse codeSubmission if it's a JSON string (from FormData)
      if (codeSubmission && typeof codeSubmission === 'string') {
        try {
          codeSubmission = JSON.parse(codeSubmission);
        } catch (error) {
          throw new Error('Invalid code submission format');
        }
      }

      const assignment = await Assignment.findByPk(assignmentId, {
        include: [{
          model: Class,
          as: 'class',
          include: [{
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }]
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
        const now = new Date();
        const startDate = new Date(assignment.startDate);

        if (now < startDate) {
          throw new Error('Assignment has not started yet. Start time: ' + startDate.toLocaleString());
        } else if (now > assignment.deadline && !assignment.allowLateSubmission) {
          throw new Error('Assignment deadline has passed and late submissions are not allowed');
        } else {
          throw new Error('Assignment is not available for submission at this time');
        }
      }

      // Check if user has already submitted
      const existingSubmission = await AssignmentSubmission.findOne({
        where: { assignmentId, userId: user.id },
        include: [{ model: Assignment, as: 'assignment' }]
      });

      // Update existing submission logic (remains mostly same but add payment check for re-submission?)
      if (existingSubmission) {
        // ... (existing update logic)
        // If updating a blocked submission, we might need to check payment again, 
        // but typically update is allowed if paying or fixing.
        // Let's keep the existing update logic for now, but ensure late payment doesn't bypass blocks if not paid.

        const updateData = {
          submissionType,
          submittedAt: new Date()
        };

        if (submissionType === 'github') {
          updateData.githubLink = githubLink;
        } else if (submissionType === 'code') {
          updateData.codeSubmission = codeSubmission;
        } else if (submissionType === 'link') {
          updateData.submissionLink = submissionLink;
        } else if (submissionType === 'zip') {
          updateData.zipFileUrl = file.path;
        }

        // Reset status to pending when updated
        updateData.status = 'pending';
        updateData.requestCorrection = false;

        // Check for late payment status on update
        if (existingSubmission.isLate && existingSubmission.paymentStatus === 'pending' && existingSubmission.assignment.paymentRequired) {
          throw new Error('Please clear pending payments for this assignment before updating.');
        }

        await existingSubmission.update(updateData);

        // Refresh the submission data
        await existingSubmission.reload({
          include: [
            {
              model: Assignment,
              as: 'assignment',
              include: [{ model: Class, as: 'class' }]
            }
          ]
        });

        return {
          message: 'Submission updated successfully',
          submission: existingSubmission
        };
      }

      // --- New Logic: Sequential Submission Check ---
      // Get all active assignments for this class, ordered by date
      const allAssignments = await Assignment.findAll({
        where: {
          classId: assignment.classId,
          isActive: true
        },
        order: [['startDate', 'ASC']],
        attributes: ['id', 'title', 'startDate']
      });

      // Find index of current assignment
      const currentIndex = allAssignments.findIndex(a => a.id === assignmentId);

      if (currentIndex > 0) {
        // Get all previous assignment IDs
        const previousAssignmentIds = allAssignments.slice(0, currentIndex).map(a => a.id);

        // Check if user has submitted all previous assignments
        const previousSubmissions = await AssignmentSubmission.findAll({
          where: {
            userId: user.id,
            assignmentId: { [Op.in]: previousAssignmentIds }
          },
          attributes: ['assignmentId', 'paymentStatus', 'isBlocked']
        });

        // 1. Check if count matches (did they submit all?)
        if (previousSubmissions.length < previousAssignmentIds.length) {
          // Find which one is missing
          const submittedIds = previousSubmissions.map(s => s.assignmentId);
          const missingAssignmentId = previousAssignmentIds.find(id => !submittedIds.includes(id));
          const missingAssignment = allAssignments.find(a => a.id === missingAssignmentId);

          throw new Error(`Please submit previous assignment "${missingAssignment.title}" first.`);
        }

        // 2. Check if any previous submission is blocked/unpaid
        const blockedSubmission = previousSubmissions.find(s => s.isBlocked || s.paymentStatus === 'pending');
        if (blockedSubmission) {
          throw new Error('Please clear pending payments for previous assignments before proceeding.');
        }
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
          // STRICT CHECK: Do not allow submission creation if not paid.
          const payment = await Payment.findOne({
            where: {
              userId: user.id,
              status: 'success',
              metadata: {
                assignmentId: assignmentId
              }
            }
          });

          if (!payment) {
            throw new Error('Deadline has passed. Please pay the late fee to enable submission.');
          }
        }
      }

      const submission = await AssignmentSubmission.create(submissionDataToSave);

      // Update leaderboard
      await this.updateClassLeaderboard(assignment.classId, user.id);

      // Send notification email to instructor (with error handling)
      try {
        if (assignment.class.instructor && assignment.class.instructor.email) {
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
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the submission if email fails
      }

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

      // Enhance leaderboard data with detailed metrics
      const enhancedLeaderboard = leaderboard.rows.map(entry => {
        const data = entry.toJSON();

        // Add detailed metrics breakdown
        data.metrics = {
          assignmentScore: {
            value: parseFloat(data.assignmentScore),
            description: 'Total score from assignments (highest score per assignment)',
            breakdown: {
              completed: data.assignmentsCompleted,
              total: data.totalAssignments,
              average: parseFloat(data.averageAssignmentScore)
            }
          },
          attendanceScore: {
            value: parseFloat(data.attendanceScore),
            description: 'Total attendance score (daily + weekly)',
            breakdown: {
              sessions: data.attendanceCount,
              average: parseFloat(data.averageAttendanceScore)
            }
          },
          timelySubmissionScore: {
            value: parseFloat(data.timelySubmissionScore),
            description: 'Bonus points for timely submissions',
            breakdown: {
              timely: data.timelySubmissions,
              total: data.totalSubmissions,
              percentage: data.totalSubmissions > 0
                ? Math.round((data.timelySubmissions / data.totalSubmissions) * 100)
                : 0
            }
          }
        };

        // Add score calculation breakdown
        data.scoreBreakdown = {
          total: parseFloat(data.totalScore),
          components: {
            assignments: parseFloat(data.assignmentScore),
            attendance: parseFloat(data.attendanceScore),
            timelySubmissions: parseFloat(data.timelySubmissionScore)
          },
          formula: 'Total Score = Assignment Score + Attendance Score + Timely Submission Score'
        };

        return data;
      });

      return {
        leaderboard: enhancedLeaderboard,
        total: leaderboard.count,
        page: parseInt(page),
        totalPages: Math.ceil(leaderboard.count / parseInt(limit)),
        metrics: {
          description: 'Leaderboard is calculated based on three main metrics:',
          components: [
            {
              name: 'Assignment Score',
              description: 'Sum of highest scores from each assignment (only accepted/reviewed submissions)',
              weight: 'Primary component'
            },
            {
              name: 'Attendance Score',
              description: 'Total attendance score from daily and weekly attendance records',
              weight: 'Secondary component'
            },
            {
              name: 'Timely Submission Score',
              description: 'Bonus points (10 per submission) for submissions made before deadline',
              weight: 'Bonus component'
            }
          ]
        }
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
        attributes: ['id', 'maxScore', 'deadline']
      });

      // Get user's assignment submissions with status
      const submissions = await AssignmentSubmission.findAll({
        where: {
          assignmentId: { [Op.in]: assignments.map(a => a.id) },
          userId
        },
        attributes: ['assignmentId', 'finalScore', 'score', 'status', 'submittedAt', 'isLate'],
        include: [
          {
            model: Assignment,
            as: 'assignment',
            attributes: ['deadline']
          }
        ]
      });

      // Calculate assignment score (highest score from all assignments)
      const validSubmissions = submissions.filter(sub =>
        sub.status === 'accepted' || sub.status === 'reviewed'
      );

      // Group submissions by assignment and get the highest score for each
      const assignmentScores = {};
      validSubmissions.forEach(submission => {
        const assignmentId = submission.assignmentId;
        const score = submission.finalScore || submission.score || 0;

        if (!assignmentScores[assignmentId] || score > assignmentScores[assignmentId]) {
          assignmentScores[assignmentId] = score;
        }
      });

      const assignmentScore = Object.values(assignmentScores).reduce((total, score) => {
        return total + score;
      }, 0);

      const averageAssignmentScore = Object.values(assignmentScores).length > 0
        ? assignmentScore / Object.values(assignmentScores).length
        : 0;

      // Calculate timely submission score
      let timelySubmissions = 0;
      let totalSubmissions = submissions.length;
      let timelySubmissionScore = 0;

      submissions.forEach(submission => {
        if (submission.submittedAt && submission.assignment && submission.assignment.deadline) {
          const submittedAt = new Date(submission.submittedAt);
          const deadline = new Date(submission.assignment.deadline);

          if (submittedAt <= deadline && !submission.isLate) {
            timelySubmissions++;
            // Award points for timely submission (e.g., 10 points per timely submission)
            timelySubmissionScore += 10;
          }
        }
      });

      // Get attendance scores (both daily and weekly)
      const dailyAttendanceScores = await AttendanceScore.findAll({
        where: { classId, userId },
        attributes: ['score']
      });

      const weeklyAttendanceScores = await WeeklyAttendance.findAll({
        where: { classId, userId },
        attributes: ['score', 'totalDaysPresent', 'totalDaysInWeek']
      });

      // Calculate total attendance score
      const dailyAttendanceScore = dailyAttendanceScores.reduce((total, score) => {
        return total + score.score;
      }, 0);

      const weeklyAttendanceScore = weeklyAttendanceScores.reduce((total, score) => {
        return total + score.score;
      }, 0);

      const attendanceScore = dailyAttendanceScore + weeklyAttendanceScore;
      const totalAttendanceSessions = dailyAttendanceScores.length + weeklyAttendanceScores.length;
      const averageAttendanceScore = totalAttendanceSessions > 0
        ? attendanceScore / totalAttendanceSessions
        : 0;

      // Calculate total score (assignment + attendance + timely submission)
      const totalScore = assignmentScore + attendanceScore + timelySubmissionScore;

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
          timelySubmissionScore: 0,
          assignmentsCompleted: 0,
          totalAssignments: assignments.length,
          attendanceCount: 0,
          totalSessions: 0,
          timelySubmissions: 0,
          totalSubmissions: 0,
          averageAssignmentScore: 0,
          averageAttendanceScore: 0,
          rank: 0
        });
      }

      // Update leaderboard entry
      await leaderboardEntry.update({
        totalScore,
        assignmentScore,
        attendanceScore,
        timelySubmissionScore,
        assignmentsCompleted: Object.keys(assignmentScores).length,
        totalAssignments: assignments.length,
        attendanceCount: totalAttendanceSessions,
        totalSessions: totalAttendanceSessions,
        timelySubmissions,
        totalSubmissions,
        averageAssignmentScore,
        averageAttendanceScore,
        lastUpdated: new Date()
      });

      // Update ranks for all students in the class
      await this.updateClassRanks(classId);

      console.log(`Updated leaderboard for user ${userId} in class ${classId}: Total=${totalScore}, Assignments=${assignmentScore}, Attendance=${attendanceScore}, Timely=${timelySubmissionScore}`);

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
        attributes: ['userId']
      });

      const userIds = enrollments.map(enrollment => enrollment.userId);

      console.log(`Refreshing leaderboard for ${userIds.length} students in class ${classId}`);

      // Update leaderboard for each student
      for (const userId of userIds) {
        await this.updateClassLeaderboard(classId, userId);
      }

      return {
        message: `Leaderboard refreshed for ${userIds.length} students`,
        studentCount: userIds.length
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

      const { score, feedback, status = 'reviewed', requestCorrection = false, correctionComments } = reviewData;

      // Validate status
      if (!['pending', 'reviewed', 'accepted'].includes(status)) {
        throw new Error('Invalid status. Must be pending, reviewed, or accepted');
      }

      // Only allow scoring when marking as accepted
      if (status !== 'accepted' && (score !== undefined && score !== null)) {
        throw new Error('Score can only be set when marking submission as accepted');
      }

      // Validate score when marking as accepted
      if (status === 'accepted') {
        if (score === undefined || score === null || score < 0 || score > submission.assignment.maxScore) {
          throw new Error(`Score must be between 0 and ${submission.assignment.maxScore} when marking as accepted`);
        }
      }

      // Update submission
      const updateData = {
        status,
        feedback: feedback !== undefined ? feedback : submission.feedback,
        reviewedAt: new Date(),
        reviewedBy: userId,
        requestCorrection: requestCorrection || false
      };

      // Only update score if marking as accepted
      if (status === 'accepted') {
        updateData.score = score;
      }

      await submission.update(updateData);

      // Update leaderboard for the student
      await this.updateClassLeaderboard(submission.assignment.classId, submission.userId);

      // Send notification to student
      try {
        let emailSubject = '';
        let emailContent = '';

        if (status === 'accepted') {
          emailSubject = `Assignment Accepted: ${submission.assignment.title}`;
          emailContent = `
            <h2>🎉 Your Assignment Has Been Accepted!</h2>
            <p><strong>Assignment:</strong> ${submission.assignment.title}</p>
            <p><strong>Score:</strong> ${score}/${submission.assignment.maxScore}</p>
            ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            <p>Congratulations! Your submission has been accepted.</p>
          `;
        } else if (requestCorrection) {
          emailSubject = `Correction Requested: ${submission.assignment.title}`;
          emailContent = `
            <h2>📝 Correction Requested</h2>
            <p><strong>Assignment:</strong> ${submission.assignment.title}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            ${correctionComments ? `<p><strong>Correction Comments:</strong> ${correctionComments}</p>` : ''}
            <p>Please review the feedback and make the necessary corrections. You can edit your submission until the deadline or until it's marked as accepted.</p>
          `;
        } else {
          emailSubject = `Assignment Reviewed: ${submission.assignment.title}`;
          emailContent = `
            <h2>Your Assignment Has Been Reviewed</h2>
            <p><strong>Assignment:</strong> ${submission.assignment.title}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            <p>Log in to your dashboard to view the full review.</p>
          `;
        }

        await sendEmail({
          to: submission.user.email,
          subject: emailSubject,
          html: emailContent
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

  // Check if user can edit submission
  async canEditSubmission(assignmentId, userId) {
    try {
      const submission = await AssignmentSubmission.findOne({
        where: { assignmentId, userId },
        include: [
          {
            model: Assignment,
            as: 'assignment'
          }
        ]
      });

      if (!submission) {
        return { canEdit: true, reason: 'No submission exists yet' };
      }

      // Cannot edit if status is 'accepted'
      if (submission.status === 'accepted') {
        return { canEdit: false, reason: 'Submission has been accepted and cannot be edited' };
      }

      // Check if deadline has passed
      const now = new Date();
      const deadline = new Date(submission.assignment.deadline);

      if (now > deadline) {
        return { canEdit: false, reason: 'Assignment deadline has passed' };
      }

      return { canEdit: true, reason: 'Submission can be edited' };
    } catch (error) {
      console.error('Error checking if user can edit submission:', error);
      throw error;
    }
  }

  // Update submission (for students)
  async updateSubmission(assignmentId, userId, updateData) {
    try {
      // Check if user can edit
      const canEdit = await this.canEditSubmission(assignmentId, userId);
      if (!canEdit.canEdit) {
        throw new Error(canEdit.reason);
      }

      const submission = await AssignmentSubmission.findOne({
        where: { assignmentId, userId }
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Update submission data
      const allowedFields = ['submissionType', 'githubLink', 'submissionLink', 'codeSubmission'];
      const updateFields = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      }

      // Reset status to pending when updated
      updateFields.status = 'pending';
      updateFields.requestCorrection = false;

      await submission.update(updateFields);

      return {
        message: 'Submission updated successfully',
        submission
      };
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  // Resend assignment notification (admin only)
  async resendAssignmentNotification(assignmentId, userId, userRole) {
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

      // Send notification emails to enrolled students
      const enrollments = await ClassEnrollment.findAll({
        where: { classId: assignment.classId },
        include: [{ model: User, as: 'student', attributes: ['email', 'firstName', 'lastName'] }]
      });

      let sentCount = 0;
      for (const enrollment of enrollments) {
        try {
          await sendEmail({
            to: enrollment.student.email,
            subject: `Reminder: New Assignment - ${assignment.title}`,
            html: `
              <h2>Assignment Reminder</h2>
              <p>This is a reminder about the following assignment:</p>
              <p><strong>Class:</strong> ${assignment.class.name}</p>
              <p><strong>Assignment:</strong> ${assignment.title}</p>
              <p><strong>Deadline:</strong> ${assignment.deadline.toLocaleString()}</p>
              <p><strong>Max Score:</strong> ${assignment.maxScore} points</p>
              <p>Log in to your dashboard to view the full assignment details and submit your work.</p>
            `
          });
          sentCount++;
        } catch (emailError) {
          console.warn(`Failed to send reminder email to ${enrollment.student.email}:`, emailError.message);
        }
      }

      return {
        message: `Notification resent successfully to ${sentCount} students`,
        sentCount
      };
    } catch (error) {
      console.error('Error resending assignment notification:', error);
      throw error;
    }
  }
}

module.exports = new AssignmentsService(); 