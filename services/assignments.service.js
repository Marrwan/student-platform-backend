const { User, Class, Assignment, AssignmentSubmission, ClassEnrollment, sequelize } = require('../models');
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
        sampleOutput,
        starterCode,
        hints,
        resources = [],
        submissionTypes = ['github', 'code', 'zip'],
        latePenalty = 10,
        allowLateSubmission = true,
        maxLateHours = 24,
        requirePayment = false,
        lateFeeAmount = 500
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
        sampleOutput,
        starterCode: starterCode || { html: '', css: '', javascript: '' },
        hints,
        resources,
        submissionTypes,
        latePenalty,
        allowLateSubmission,
        maxLateHours,
        requirePayment,
        lateFeeAmount
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
      const assignment = await Assignment.findByPk(assignmentId, {
        include: [
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
          },
          user.role === 'student' ? [
            {
              model: AssignmentSubmission,
              as: 'submissions',
              where: { userId: user.id },
              required: false
            }
          ] : []
        ]
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
        return assignment;
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

      // Check if there are any submissions
      const submissionCount = await AssignmentSubmission.count({ where: { assignmentId } });
      if (submissionCount > 0) {
        throw new Error(`Cannot delete assignment with ${submissionCount} submissions`);
      }

      await assignment.destroy();

      return { message: 'Assignment deleted successfully' };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Submit assignment
  async submitAssignment(assignmentId, submissionData, user, file) {
    try {
      const { submissionType, githubLink, codeSubmission } = submissionData;

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
        throw new Error('You have already submitted this assignment');
      }

      // Validate submission based on type
      if (submissionType === 'github' && !githubLink) {
        throw new Error('GitHub link is required for GitHub submissions');
      }

      if (submissionType === 'code' && !codeSubmission) {
        throw new Error('Code submission is required for code submissions');
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
      } else if (submissionType === 'zip') {
        submissionDataToSave.zipFileUrl = file.path; // Store file path
      }

      // Check if submission is late
      const isLate = new Date() > assignment.deadline;
      if (isLate) {
        submissionDataToSave.isLate = true;
        submissionDataToSave.latePenalty = assignment.calculateLatePenalty(new Date());
      }

      const submission = await AssignmentSubmission.create(submissionDataToSave);

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
        `
      });

      return {
        message: 'Assignment submitted successfully',
        submission
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
}

module.exports = new AssignmentsService(); 