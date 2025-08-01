const { Submission, Project, User, PlagiarismReport, Payment } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');

class SubmissionsService {
  // Submit project
  async submitProject(submissionData, user, file) {
    try {
      const { projectId, githubLink, codeContent } = submissionData;
      
      // Check if project exists and is unlocked
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found.');
      }
      
      if (!project.isUnlocked) {
        throw new Error('This project is not yet unlocked.');
      }
      
      // Check if project is overdue
      const now = new Date();
      const deadline = new Date(project.deadline);
      const isOverdue = now > deadline;
      
      if (isOverdue) {
        throw new Error('This project is overdue and cannot be submitted.');
      }
      
      // Check if user already submitted this project
      const existingSubmission = await Submission.findOne({
        where: { userId: user.id, projectId }
      });
      
      if (existingSubmission) {
        throw new Error('You have already submitted this project.');
      }
      
      // Validate submission type
      if (project.submissionType !== 'all') {
        if (project.submissionType === 'github' && !githubLink) {
          throw new Error('GitHub link is required for this project.');
        }
        if (project.submissionType === 'code' && !codeContent) {
          throw new Error('Code submission is required for this project.');
        }
        if (project.submissionType === 'zip' && !file) {
          throw new Error('ZIP file upload is required for this project.');
        }
      }
      
      // Check for plagiarism (code similarity)
      if (codeContent) {
        // Find all other submissions for this project
        const otherSubs = await Submission.findAll({ where: { projectId, userId: { [Op.ne]: user.id } } });
        let maxSimilarity = 0;
        let flagged = false;
        for (const other of otherSubs) {
          // Simple similarity: percent of identical lines (placeholder, replace with real logic)
          const linesA = codeContent.split('\n');
          const linesB = (other.codeContent || '').split('\n');
          const common = linesA.filter(line => linesB.includes(line)).length;
          const similarity = linesA.length > 0 ? (common / linesA.length) * 100 : 0;
          if (similarity > maxSimilarity) maxSimilarity = similarity;
          if (similarity > 80) flagged = true;
          await PlagiarismReport.create({
            submissionId: null, // will update after submission is created
            comparedSubmissionId: other.id,
            similarity,
            flagged: similarity > 80,
            details: { linesA: linesA.length, linesB: linesB.length, common },
          });
        }
        // If flagged, reject submission
        if (flagged) {
          throw new Error('Plagiarism detected. Submission rejected.');
        }
      }
      
      // For late submissions, require payment before accepting
      if (isOverdue) {
        // Check if payment exists and is successful
        const payment = await Payment.findOne({ where: { userId: user.id, submissionId: null, status: 'success', type: 'late_fee' } });
        if (!payment) {
          throw new Error('Late fee payment required before submitting overdue project.');
        }
      }
      
      // Create submission
      const submissionDataToSave = {
        userId: user.id,
        projectId,
        githubLink: githubLink || null,
        codeContent: codeContent || null,
        fileUrl: file ? `/uploads/${file.filename}` : null,
        submittedAt: new Date(),
        isLate: false,
        status: 'pending'
      };
      
      const submission = await Submission.create(submissionDataToSave);
      
      // After creating the submission:
      await PlagiarismReport.update({ submissionId: submission.id }, { where: { submissionId: null, comparedSubmissionId: { [Op.ne]: null } } });
      
      return {
        message: 'Project submitted successfully',
        submission
      };
    } catch (error) {
      console.error('Submit project error:', error);
      throw error;
    }
  }

  // Get user's submissions
  async getUserSubmissions(userId, params) {
    try {
      const { page = 1, limit = 20, status } = params;
      
      const whereClause = { userId };
      if (status) whereClause.status = status;
      
      const submissions = await Submission.findAndCountAll({
        where: whereClause,
        include: [{
          model: Project,
          attributes: ['id', 'title', 'day', 'maxScore', 'deadline']
        }],
        order: [['submittedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
      
      return {
        submissions: submissions.rows,
        total: submissions.count,
        totalPages: Math.ceil(submissions.count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Get my submissions error:', error);
      throw error;
    }
  }

  // Get single submission
  async getSubmissionById(submissionId, user) {
    try {
      const submission = await Submission.findByPk(submissionId, {
        include: [
          {
            model: Project,
            attributes: ['id', 'title', 'day', 'maxScore', 'deadline']
          },
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      
      if (!submission) {
        throw new Error('Submission not found.');
      }
      
      // Users can only view their own submissions unless they're admin
      if (user.role === 'user' && submission.userId !== user.id) {
        throw new Error('Access denied.');
      }
      
      return submission;
    } catch (error) {
      console.error('Get submission error:', error);
      throw error;
    }
  }

  // Update submission (admin only)
  async updateSubmission(submissionId, updateData, adminUserId) {
    try {
      const { status, score, feedback, adminComments } = updateData;
      
      const submission = await Submission.findByPk(submissionId, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Project, attributes: ['id', 'title', 'day'] }
        ]
      });
      
      if (!submission) {
        throw new Error('Submission not found.');
      }
      
      await submission.update({
        status,
        score: score || 0,
        feedback,
        adminComments,
        reviewedBy: adminUserId,
        reviewedAt: new Date()
      });
      
      // Send email notification to user
      await sendEmail({
        to: submission.User.email,
        subject: `Project Review: Day ${submission.Project.day}`,
        html: `
          <h2>Your submission has been reviewed!</h2>
          <p><strong>Project:</strong> Day ${submission.Project.day} - ${submission.Project.title}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Score:</strong> ${score || 0} points</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          <p>Log in to your dashboard to view the full review.</p>
        `
      });
      
      return submission;
    } catch (error) {
      console.error('Update submission error:', error);
      throw error;
    }
  }

  // Delete submission (admin only)
  async deleteSubmission(submissionId) {
    try {
      const submission = await Submission.findByPk(submissionId);
      if (!submission) {
        throw new Error('Submission not found.');
      }
      
      await submission.destroy();
      return { message: 'Submission deleted successfully' };
    } catch (error) {
      console.error('Delete submission error:', error);
      throw error;
    }
  }

  // Get submission statistics (admin only)
  async getSubmissionStats() {
    try {
      const totalSubmissions = await Submission.count();
      const pendingSubmissions = await Submission.count({ where: { status: 'pending' } });
      const acceptedSubmissions = await Submission.count({ where: { status: 'accepted' } });
      const rejectedSubmissions = await Submission.count({ where: { status: 'rejected' } });
      const lateSubmissions = await Submission.count({ where: { isLate: true } });
      
      const averageScore = await Submission.findOne({
        where: { status: 'accepted' },
        attributes: [[require('sequelize').fn('AVG', require('sequelize').col('score')), 'averageScore']]
      });
      
      return {
        totalSubmissions,
        pendingSubmissions,
        acceptedSubmissions,
        rejectedSubmissions,
        lateSubmissions,
        averageScore: parseFloat(averageScore?.getDataValue('averageScore') || 0)
      };
    } catch (error) {
      console.error('Get submission stats error:', error);
      throw error;
    }
  }

  // Get submissions by project (admin only)
  async getSubmissionsByProject(projectId, params) {
    try {
      const { page = 1, limit = 20, status } = params;
      
      const whereClause = { projectId };
      if (status) whereClause.status = status;
      
      const submissions = await Submission.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Project,
            attributes: ['id', 'title', 'day', 'maxScore']
          }
        ],
        order: [['submittedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
      
      return {
        submissions: submissions.rows,
        total: submissions.count,
        totalPages: Math.ceil(submissions.count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Get project submissions error:', error);
      throw error;
    }
  }
}

module.exports = new SubmissionsService(); 