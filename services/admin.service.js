const { User, Project, Submission, Class, Assignment, AssignmentSubmission, Payment, ClassEnrollment, sequelize } = require('../models');
const { sendEmail } = require('../utils/email');

class AdminService {
  // Get admin dashboard statistics
  async getStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalClasses,
        totalProjects,
        totalSubmissions,
        pendingSubmissions,
        averageScoreObj,
        totalRevenueObj,
        activeChallenges
      ] = await Promise.all([
        User.count({ where: { role: 'student' } }),
        User.count({ where: { role: 'student', isActive: true } }),
        Class.count(),
        Project.count(),
        Submission.count(),
        Submission.count({ where: { status: 'pending' } }),
        Submission.findOne({
          attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'average']],
          where: { status: 'accepted' }
        }),
        Payment.findOne({
          attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
          where: { status: 'success' }
        }).catch(() => null),
        Project.count({ where: { isActive: true } })
      ]);

      // Avoid division by zero
      let completionRate = 0;
      if (totalUsers > 0 && totalProjects > 0) {
        completionRate = (totalSubmissions / (totalUsers * totalProjects)) * 100;
      }
      const averageScore = averageScoreObj ? parseFloat(averageScoreObj.getDataValue('average')) : 0;
      const totalRevenue = totalRevenueObj ? parseFloat(totalRevenueObj.getDataValue('total')) : 0;

      return {
        totalUsers,
        totalClasses,
        totalProjects,
        pendingSubmissions,
        completionRate: Math.round(completionRate * 100) / 100,
        activeChallenges,
        totalRevenue,
        averageScore
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return default values if there's an error
      return {
        totalUsers: 0,
        totalClasses: 0,
        totalProjects: 0,
        pendingSubmissions: 0,
        completionRate: 0,
        activeChallenges: 0,
        totalRevenue: 0,
        averageScore: 0
      };
    }
  }

  // Get admin payments (paginated)
  async getPayments(params) {
    try {
      const { page = 1, limit = 20, status, type } = params;
      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await Payment.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Submission, as: 'submission', attributes: ['id', 'projectId'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        data: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      };
    } catch (err) {
      console.error('Error fetching admin payments:', err);
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 1,
        totalPages: 0
      };
    }
  }

  // Get all projects (admin view)
  async getProjects() {
    try {
      const projects = await Project.findAll({
        order: [['day', 'ASC']],
        include: [
          {
            model: Submission,
            as: 'submissions',
            attributes: ['id', 'status', 'score', 'submittedAt']
          }
        ]
      });

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const {
        title,
        description,
        day,
        difficulty,
        maxScore,
        deadline,
        requirements = '',
        sampleOutput
      } = projectData;

      // Check if project for this day already exists
      const existingProject = await Project.findOne({ where: { day } });
      if (existingProject) {
        throw new Error(`Project for day ${day} already exists`);
      }

      const project = await Project.create({
        title,
        description,
        day,
        difficulty,
        maxScore,
        deadline: new Date(deadline),
        requirements,
        sampleOutput,
        isUnlocked: false
      });

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId, updateData) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      await project.update(updateData);
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Toggle project lock status
  async toggleProjectLock(projectId, isUnlocked) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      await project.update({ isUnlocked });

      // If unlocking, send notification to all active users
      if (isUnlocked) {
        const activeUsers = await User.findAll({
          where: { role: 'student', isActive: true }
        });

        for (const user of activeUsers) {
          await sendEmail({
            to: user.email,
            subject: `New Project Unlocked: Day ${project.day}`,
            html: `
              <h2>New Project Available!</h2>
              <p>Day ${project.day}: ${project.title} is now unlocked.</p>
              <p><strong>Difficulty:</strong> ${project.difficulty}</p>
              <p><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</p>
              <p>Log in to your dashboard to start working on this project!</p>
            `
          });
        }
      }

      return project;
    } catch (error) {
      console.error('Error toggling project lock:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if there are any submissions for this project
      const submissionCount = await Submission.count({ where: { projectId } });
      if (submissionCount > 0) {
        throw new Error(`Cannot delete project with ${submissionCount} existing submissions`);
      }

      await project.destroy();
      return { message: 'Project deleted successfully' };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Get all submissions (admin view)
  async getSubmissions(params) {
    try {
      const { status, projectId, page = 1, limit = 20 } = params;

      const where = {};
      if (status) where.status = status;
      if (projectId) where.projectId = projectId;

      const submissions = await Submission.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'title', 'day', 'maxScore']
          }
        ],
        order: [['submittedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        data: submissions.rows,
        total: submissions.count,
        page: parseInt(page),
        totalPages: Math.ceil(submissions.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions');
    }
  }

  // Review submission
  async reviewSubmission(submissionId, reviewData, adminId) {
    try {
      const { status, score, feedback, adminComments } = reviewData;

      const submission = await Submission.findByPk(submissionId, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Project, as: 'project', attributes: ['id', 'title', 'day'] }
        ]
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      await submission.update({
        status,
        score: score || 0,
        adminFeedback: feedback,
        adminComments,
        reviewedBy: adminId,
        reviewedAt: new Date()
      });

      // Send email notification to user
      await sendEmail({
        to: submission.user.email,
        subject: `Project Review: Day ${submission.project.day}`,
        html: `
          <h2>Your submission has been reviewed!</h2>
          <p><strong>Project:</strong> Day ${submission.project.day} - ${submission.project.title}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Score:</strong> ${score || 0} points</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          <p>Log in to your dashboard to view the full review.</p>
        `
      });

      return { message: 'Submission reviewed successfully', submission };
    } catch (error) {
      console.error('Error reviewing submission:', error);
      throw error;
    }
  }

  // Get all users (admin view)
  async getUsers(params) {
    try {
      const { role, isActive, page = 1, limit = 20 } = params;

      const where = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const users = await User.findAndCountAll({
        where,
        attributes: [
          'id', 'firstName', 'lastName', 'email', 'role', 'isActive',
          'totalScore', 'completedProjects', 'streakCount', 'createdAt'
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        users: users.rows,
        total: users.count,
        page: parseInt(page),
        totalPages: Math.ceil(users.count / parseInt(limit))
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Activate/deactivate user
  async toggleUserStatus(userId, isActive) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent deactivating the last admin
      if (user.role === 'admin' && !isActive) {
        const adminCount = await User.count({ where: { role: 'admin', isActive: true } });
        if (adminCount <= 1) {
          throw new Error('Cannot deactivate the last admin user');
        }
      }

      await user.update({ isActive });

      // Send email notification
      await sendEmail({
        to: user.email,
        subject: `Account ${isActive ? 'Activated' : 'Deactivated'}`,
        html: `
          <h2>Account Status Update</h2>
          <p>Your account has been <strong>${isActive ? 'activated' : 'deactivated'}</strong>.</p>
          ${isActive ? '<p>You can now log in and access the platform.</p>' : '<p>You will not be able to log in until your account is reactivated.</p>'}
        `
      });

      return user;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Verify user manually (admin override)
  async verifyUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.update({
        emailVerified: true,
        isActive: true // Also activate the user so they can login immediately
      });

      // Send email notification
      try {
        await sendEmail({
          to: user.email,
          subject: 'Account Verified',
          html: `
            <h2>Account Verified</h2>
            <p>Your account has been manually verified by an administrator.</p>
            <p>You can now log in to the platform.</p>
          `
        });
      } catch (emailError) {
        console.warn('Failed to send verification email:', emailError);
        // Don't fail the verification process if email fails
      }

      return user;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Get user details with full statistics
  async getUserDetails(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Submission,
            as: 'submissions',
            include: [{ model: Project, as: 'project', attributes: ['id', 'title', 'day'] }],
            order: [['submittedAt', 'DESC']]
          }
        ]
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  // Get admin assignments
  async getAssignments() {
    try {
      const assignments = await Assignment.findAll({
        include: [{ model: Class, as: 'class' }],
        order: [['createdAt', 'DESC']]
      });
      return { assignments };
    } catch (err) {
      console.error('Error fetching assignments:', err);
      throw new Error('Failed to fetch assignments');
    }
  }

  // Create assignment
  async createAssignment(assignmentData) {
    try {
      const assignment = await Assignment.create({
        ...assignmentData,
        isUnlocked: true, // Automatically unlock assignments when created
        isActive: true
      });
      return { message: 'Assignment created successfully', assignment };
    } catch (err) {
      console.error('Error creating assignment:', err);
      throw new Error('Failed to create assignment');
    }
  }

  // Update assignment
  async updateAssignment(assignmentId, updateData) {
    try {
      const assignment = await Assignment.findByPk(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      await assignment.update(updateData);
      return { message: 'Assignment updated successfully', assignment };
    } catch (err) {
      console.error('Error updating assignment:', err);
      throw new Error('Failed to update assignment');
    }
  }

  // Get admin classes
  async getClasses(params = {}) {
    try {
      const { level, status } = params;
      const whereClause = {};

      if (level && level !== 'all') {
        whereClause.level = level;
      }

      if (status && status !== 'all') {
        whereClause.isActive = status === 'active';
      }

      const classes = await Class.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'instructor' },
          { model: ClassEnrollment, as: 'enrollments' },
          { model: Assignment, as: 'assignments' }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Add computed fields to each class
      const classesWithStats = await Promise.all(classes.map(async (cls) => {
        const classData = cls.toJSON();

        // Use actual level from database, fallback to 'beginner' if not set
        classData.level = classData.level || 'beginner';
        classData.currentStudents = cls.enrollments ? cls.enrollments.length : 0;
        classData.assignments = cls.assignments ? cls.assignments.length : 0;
        classData.instructorName = cls.instructor ? `${cls.instructor.firstName} ${cls.instructor.lastName}` : 'Unknown';

        // Calculate completion rate and average score from enrollments
        let totalProgress = 0;
        let totalScore = 0;
        let activeEnrollments = 0;

        if (cls.enrollments) {
          cls.enrollments.forEach(enrollment => {
            if (enrollment.status === 'active') {
              totalProgress += enrollment.progress || 0;
              totalScore += enrollment.averageScore || 0;
              activeEnrollments++;
            }
          });
        }

        classData.completionRate = activeEnrollments > 0 ? Math.round(totalProgress / activeEnrollments) : 0;
        classData.averageScore = activeEnrollments > 0 ? Math.round(totalScore / activeEnrollments) : 0;

        return classData;
      }));

      return { classes: classesWithStats };
    } catch (err) {
      console.error('Error fetching classes:', err);
      throw new Error('Failed to fetch classes');
    }
  }

  // Create class
  async createClass(classData, instructorId) {
    try {
      // Generate unique enrollment code
      let enrollmentCode;
      let isUnique = false;
      while (!isUnique) {
        enrollmentCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const existingClass = await Class.findOne({ where: { enrollmentCode } });
        if (!existingClass) isUnique = true;
      }

      const classInstance = await Class.create({
        ...classData,
        instructorId,
        enrollmentCode
      });
      return { message: 'Class created successfully', class: classInstance };
    } catch (err) {
      console.error('Error creating class:', err);
      throw new Error('Failed to create class');
    }
  }

  // Get class students
  async getClassStudents(classId) {
    try {
      const enrollments = await ClassEnrollment.findAll({
        where: { classId },
        include: [{ model: User, as: 'student' }]
      });
      const students = enrollments.map(enrollment => enrollment.student);
      return { students };
    } catch (err) {
      console.error('Error fetching class students:', err);
      throw new Error('Failed to fetch class students');
    }
  }

  // Send class invitations
  async sendClassInvitations(classId, invitationData) {
    try {
      const { emails, message } = invitationData;

      // Validate class exists
      const classData = await Class.findByPk(classId);
      if (!classData) {
        throw new Error('Class not found');
      }

      // Validate emails
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new Error('Valid email list is required');
      }

      const results = [];

      for (const email of emails) {
        try {
          // Check if user already exists
          let user = await User.findOne({ where: { email } });

          if (!user) {
            // Create new user account
            user = await User.create({
              email,
              firstName: email.split('@')[0], // Use email prefix as first name
              lastName: 'Student',
              role: 'student',
              isActive: true,
              emailVerified: false,
              password: '$2a$12$FRS4Kc7e43tcCb2vZB7nleSdLzz3aR/d4./gFhnmNjVTAqSLccdNi', // Default password: password123
              permissions: {
                canCreateClasses: false,
                canViewAnalytics: false,
                canManageProjects: false,
                canManageStudents: false,
                canReviewSubmissions: false
              }
            });
          }

          // Check if user is already enrolled
          const existingEnrollment = await ClassEnrollment.findOne({
            where: { classId, userId: user.id }
          });

          if (existingEnrollment) {
            results.push({ email, status: 'already_enrolled', message: 'User already enrolled in this class' });
            continue;
          }

          // Don't automatically enroll - just send invitation email
          // User will need to join using the enrollment code

          // Send invitation email
          try {
            const emailResult = await sendEmail({
              to: email,
              subject: `Invitation to join ${classData.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Class Invitation</h2>
                  <p>You have been invited to join <strong>${classData.name}</strong> by Admin User.</p>
                  <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Class:</strong> ${classData.name}</p>
                    <p><strong>Description:</strong> ${classData.description}</p>
                    <p><strong>Enrollment Code:</strong> ${classData.enrollmentCode}</p>
                    ${message ? `<p><strong>Message from instructor:</strong> ${message}</p>` : ''}
                  </div>
                  <p>Log in to your account to access the class materials and assignments.</p>
                  <p>If you don't have an account, you can register using this email address.</p>
                  <p>Best regards,<br>The Learning Platform Team</p>
                </div>
              `
            });

            if (!emailResult.success) {
              console.warn(`Failed to send email to ${email}:`, emailResult.error);
            }
          } catch (emailError) {
            console.error(`Error sending invitation email to ${email}:`, emailError);
            // Don't fail the entire invitation process if email fails
          }

          results.push({ email, status: 'success', message: 'Invitation sent successfully' });
        } catch (emailError) {
          console.error(`Error processing invitation for ${email}:`, emailError);
          results.push({ email, status: 'error', message: emailError.message });
        }
      }

      return {
        message: 'Invitation processing completed',
        results,
        totalProcessed: emails.length,
        successful: results.filter(r => r.status === 'success').length
      };
    } catch (err) {
      console.error('Error sending invitations:', err);
      throw new Error('Failed to send invitations');
    }
  }

  // Get project by ID
  async getProjectById(projectId) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      return { project };
    } catch (err) {
      console.error('Error fetching project:', err);
      throw new Error('Failed to fetch project');
    }
  }

  // Get admin activity
  async getActivity() {
    try {
      // Get recent submissions
      const recentSubmissions = await Submission.findAll({
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
          { model: Project, as: 'project', attributes: ['title'] }
        ],
        order: [['submittedAt', 'DESC']],
        limit: 5
      });

      // Get recent user registrations
      const recentUsers = await User.findAll({
        where: { role: 'student' },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // Get recent class activities
      const recentClasses = await Class.findAll({
        include: [
          { model: User, as: 'instructor', attributes: ['firstName', 'lastName'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      const activity = [];

      // Add submission activities
      recentSubmissions.forEach(submission => {
        activity.push({
          id: submission.id,
          type: 'submission',
          message: `${submission.user.firstName} ${submission.user.lastName} submitted ${submission.project.title}`,
          timestamp: submission.submittedAt,
          user: `${submission.user.firstName} ${submission.user.lastName}`,
          project: submission.project.title
        });
      });

      // Add user registration activities
      recentUsers.forEach(user => {
        activity.push({
          id: user.id,
          type: 'registration',
          message: `New user ${user.firstName} ${user.lastName} registered`,
          timestamp: user.createdAt,
          user: `${user.firstName} ${user.lastName}`
        });
      });

      // Add class creation activities
      recentClasses.forEach(classItem => {
        activity.push({
          id: classItem.id,
          type: 'class_created',
          message: `New class "${classItem.name}" created by ${classItem.instructor.firstName} ${classItem.instructor.lastName}`,
          timestamp: classItem.createdAt,
          user: `${classItem.instructor.firstName} ${classItem.instructor.lastName}`
        });
      });

      // Sort by timestamp and return top 10
      activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { activity: activity.slice(0, 10) };
    } catch (err) {
      console.error('Error fetching activity:', err);
      throw new Error('Failed to fetch activity');
    }
  }

  // Get admin recent activity
  async getRecentActivity() {
    try {
      // Get recent submissions
      const recentSubmissions = await Submission.findAll({
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
          { model: Project, as: 'project', attributes: ['title'] }
        ],
        order: [['submittedAt', 'DESC']],
        limit: 3
      });

      // Get recent user registrations
      const recentUsers = await User.findAll({
        where: { role: 'student' },
        order: [['createdAt', 'DESC']],
        limit: 3
      });

      // Get recent class activities
      const recentClasses = await Class.findAll({
        include: [
          { model: User, as: 'instructor', attributes: ['firstName', 'lastName'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 3
      });

      const activity = [];

      // Add submission activities
      recentSubmissions.forEach(submission => {
        activity.push({
          id: submission.id,
          type: 'submission',
          message: `${submission.user.firstName} ${submission.user.lastName} submitted ${submission.project.title}`,
          timestamp: submission.submittedAt,
          user: `${submission.user.firstName} ${submission.user.lastName}`,
          project: submission.project.title
        });
      });

      // Add user registration activities
      recentUsers.forEach(user => {
        activity.push({
          id: user.id,
          type: 'registration',
          message: `New user ${user.firstName} ${user.lastName} registered`,
          timestamp: user.createdAt,
          user: `${user.firstName} ${user.lastName}`
        });
      });

      // Add class creation activities
      recentClasses.forEach(classItem => {
        activity.push({
          id: classItem.id,
          type: 'class_created',
          message: `New class "${classItem.name}" created by ${classItem.instructor.firstName} ${classItem.instructor.lastName}`,
          timestamp: classItem.createdAt,
          user: `${classItem.instructor.firstName} ${classItem.instructor.lastName}`
        });
      });

      // Sort by timestamp and return top 5
      activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { activity: activity.slice(0, 5) };
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      throw new Error('Failed to fetch recent activity');
    }
  }

  // Get quick submissions
  async getQuickSubmissions() {
    try {
      const submissions = await Submission.findAll({
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
          { model: Project, as: 'project', attributes: ['title'] }
        ],
        order: [['submittedAt', 'DESC']],
        limit: 10
      });

      const formattedSubmissions = submissions.map(submission => ({
        id: submission.id,
        projectTitle: submission.project?.title || 'Unknown Project',
        studentName: `${submission.user?.firstName || ''} ${submission.user?.lastName || ''}`.trim(),
        submittedAt: submission.submittedAt,
        status: submission.status,
        score: submission.score
      }));

      return { data: formattedSubmissions };
    } catch (err) {
      console.error('Error fetching quick submissions:', err);
      throw new Error('Failed to fetch quick submissions');
    }
  }
}

module.exports = new AdminService(); 