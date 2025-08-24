const { User, Class, ClassEnrollment, Assignment, AssignmentSubmission, sequelize } = require('../models');
const { sendEmail } = require('../utils/email');

class ClassesService {
  // Get all classes (admin) or user's enrolled classes (student)
  async getAllClasses(user, params) {
    try {
      const { page = 1, limit = 20, status } = params;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      if (user.role === 'admin' || user.role === 'partial_admin') {
        // Admin sees all classes
        const whereClause = {};
        if (status) whereClause.isActive = status === 'active';
        
        const classes = await Class.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: ClassEnrollment,
              as: 'enrollments',
              attributes: ['id']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        // Add student count to each class
        const classesWithCounts = classes.rows.map(cls => {
          const classData = cls.toJSON();
          classData.studentCount = cls.enrollments.length;
          return classData;
        });

        return {
          classes: classesWithCounts,
          total: classes.count,
          page: parseInt(page),
          totalPages: Math.ceil(classes.count / parseInt(limit))
        };
      } else {
        // Students see all active classes and their enrollment status
        const whereClause = { isActive: true };
        if (status) whereClause.isActive = status === 'active';
        
        const classes = await Class.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: ClassEnrollment,
              as: 'enrollments',
              where: { userId: user.id },
              required: false
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        // Add enrollment status and student count to each class
        const classesWithStatus = classes.rows.map(cls => {
          const classData = cls.toJSON();
          classData.isEnrolled = cls.enrollments.length > 0;
          classData.studentCount = cls.enrollments.length;
          return classData;
        });

        return {
          classes: classesWithStatus,
          total: classes.count,
          page: parseInt(page),
          totalPages: Math.ceil(classes.count / parseInt(limit))
        };
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  // Create new class (admin only)
  async createClass(classData, instructorId) {
    try {
      const {
        name,
        description,
        maxStudents = 50,
        startDate,
        endDate,
        settings = {}
      } = classData;

      // Generate unique enrollment code
      let enrollmentCode;
      let isUnique = false;
      while (!isUnique) {
        enrollmentCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const existingClass = await Class.findOne({ where: { enrollmentCode } });
        if (!existingClass) isUnique = true;
      }

      const classDataToSave = await Class.create({
        name,
        description,
        instructorId,
        enrollmentCode,
        maxStudents,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        settings: {
          allowLateSubmissions: true,
          latePenalty: 10,
          maxLateHours: 24,
          requireApproval: false,
          allowStudentInvites: false,
          notificationSettings: {
            email: true,
            push: true
          },
          ...settings
        }
      });

      return {
        message: 'Class created successfully',
        class: classDataToSave
      };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  // Get single class details
  async getClassById(classId, user) {
    try {
      const classData = await Class.findByPk(classId, {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: ClassEnrollment,
            as: 'enrollments',
            include: [
              {
                model: User,
                as: 'student',
                attributes: ['id', 'firstName', 'lastName', 'email', 'role']
              }
            ]
          },
          {
            model: Assignment,
            as: 'assignments',
            where: user.role === 'student' ? { isUnlocked: true } : {},
            required: false,
            order: [['startDate', 'ASC']]
          }
        ]
      });

      if (!classData) {
        throw new Error('Class not found');
      }

      // Check if user has access to this class
      if (user.role === 'student') {
        const enrollment = await ClassEnrollment.findOne({
          where: { classId, userId: user.id }
        });
        
        if (!enrollment && classData.instructorId !== user.id) {
          throw new Error('Access denied');
        }
      }

      // Add student count
      const classWithCounts = classData.toJSON();
      classWithCounts.studentCount = classData.enrollments.length;
      classWithCounts.isEnrolled = user.role === 'student' ? 
        classData.enrollments.some(e => e.student.id === user.id) : 
        classData.instructorId === user.id;

      return classWithCounts;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  // Update class (admin only)
  async updateClass(classId, updateData, userId, userRole) {
    try {
      const classData = await Class.findByPk(classId);

      if (!classData) {
        throw new Error('Class not found');
      }

      // Check if user is the instructor or admin
      if (classData.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      await classData.update(updateData);

      return {
        message: 'Class updated successfully',
        class: classData
      };
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  // Delete class (admin only)
  async deleteClass(classId, userId, userRole) {
    try {
      const classData = await Class.findByPk(classId);

      if (!classData) {
        throw new Error('Class not found');
      }

      // Check if user is the instructor or admin
      if (classData.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      // Check if there are any enrollments
      const enrollmentCount = await ClassEnrollment.count({ where: { classId } });
      if (enrollmentCount > 0) {
        throw new Error(`Cannot delete class with ${enrollmentCount} enrolled students`);
      }

      await classData.destroy();

      return { message: 'Class deleted successfully' };
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Join class using enrollment code
  async joinClass(enrollmentCode, user) {
    try {
      const classData = await Class.findOne({
        where: { enrollmentCode, isActive: true },
        include: [{ model: User, as: 'instructor' }]
      });

      if (!classData) {
        throw new Error('Invalid enrollment code or class not found');
      }

      // Check if user is already enrolled
      const existingEnrollment = await ClassEnrollment.findOne({
        where: { classId: classData.id, userId: user.id }
      });

      if (existingEnrollment) {
        return {
          message: 'You are already enrolled in this class',
          alreadyEnrolled: true,
          classId: classData.id,
          className: classData.name
        };
      }

      // Check if class is full
      const currentEnrollmentCount = await ClassEnrollment.count({
        where: { classId: classData.id }
      });

      if (currentEnrollmentCount >= classData.maxStudents) {
        throw new Error('Class is full');
      }

      // Create enrollment
      const enrollment = await ClassEnrollment.create({
        classId: classData.id,
        userId: user.id,
        enrolledAt: new Date()
      });

      // Send notification email to instructor
      await sendEmail({
        to: classData.instructor.email,
        subject: `New Student Enrolled: ${classData.name}`,
        html: `
          <h2>New Student Enrollment</h2>
          <p><strong>Student:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
          <p><strong>Class:</strong> ${classData.name}</p>
          <p><strong>Enrolled:</strong> ${new Date().toLocaleDateString()}</p>
        `
      });

      return {
        message: 'Successfully enrolled in class',
        enrollment
      };
    } catch (error) {
      console.error('Error joining class:', error);
      throw error;
    }
  }

  // Request to join class
  async requestToJoinClass(classId, user, message) {
    try {
      const classData = await Class.findByPk(classId, {
        include: [{ model: User, as: 'instructor' }]
      });

      if (!classData) {
        throw new Error('Class not found');
      }

      if (!classData.isActive) {
        throw new Error('Class is not active');
      }

      // Check if user is already enrolled
      const existingEnrollment = await ClassEnrollment.findOne({
        where: { classId, userId: user.id }
      });

      if (existingEnrollment) {
        throw new Error('You are already enrolled in this class');
      }

      // Check if class requires approval
      if (!classData.settings?.requireApproval) {
        throw new Error('This class does not require approval. Use the enrollment code to join directly.');
      }

      // Check if class is full
      const currentEnrollmentCount = await ClassEnrollment.count({
        where: { classId }
      });

      if (currentEnrollmentCount >= classData.maxStudents) {
        throw new Error('Class is full');
      }

      // Create pending enrollment
      const enrollment = await ClassEnrollment.create({
        classId,
        userId: user.id,
        enrolledAt: new Date(),
        status: 'pending'
      });

      // Send notification to instructor
      await sendEmail({
        to: classData.instructor.email,
        subject: `Join Request: ${classData.name}`,
        html: `
          <h2>New Join Request</h2>
          <p><strong>Student:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
          <p><strong>Class:</strong> ${classData.name}</p>
          <p><strong>Requested:</strong> ${new Date().toLocaleDateString()}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p>Please review and approve or reject this request.</p>
        `
      });

      return {
        message: 'Join request submitted successfully. Waiting for instructor approval.',
        class: classData,
        enrollment
      };
    } catch (error) {
      console.error('Error requesting to join class:', error);
      throw error;
    }
  }

  // Leave class
  async leaveClass(classId, userId) {
    try {
      const enrollment = await ClassEnrollment.findOne({
        where: { classId, userId }
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      await enrollment.destroy();

      return { message: 'Successfully left the class' };
    } catch (error) {
      console.error('Error leaving class:', error);
      throw error;
    }
  }

  // Get class assignments
  async getClassAssignments(classId, user, params) {
    try {
      const { page = 1, limit = 20, status } = params;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Check if user has access to this class
      if (user.role === 'student') {
        const enrollment = await ClassEnrollment.findOne({
          where: { classId, userId: user.id }
        });
        
        if (!enrollment) {
          throw new Error('Access denied');
        }
      }

      const whereClause = { classId };
      if (status === 'active') whereClause.isActive = true;
      if (status === 'unlocked') whereClause.isUnlocked = true;

      const assignments = await Assignment.findAndCountAll({
        where: whereClause,
        include: user.role === 'student' ? [
          {
            model: AssignmentSubmission,
            as: 'submissions',
            where: { userId: user.id },
            required: false
          }
        ] : [],
        order: [['startDate', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // For students, add submission status
      if (user.role === 'student') {
        assignments.rows = assignments.rows.map(assignment => {
          const assignmentData = assignment.toJSON();
          const submission = assignment.submissions?.[0];
          
          assignmentData.submissionStatus = submission ? submission.status : 'not_submitted';
          assignmentData.submissionScore = submission ? submission.score : null;
          assignmentData.isOverdue = assignment.isOverdue();
          assignmentData.timeRemaining = assignment.getTimeRemaining();
          
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
      console.error('Error fetching class assignments:', error);
      throw error;
    }
  }

  // Invite students to class (admin only)
  async inviteStudents(classId, inviteData, userId, userRole) {
    try {
      const { emails, message } = inviteData;

      const classData = await Class.findByPk(classId, {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['firstName', 'lastName']
          }
        ]
      });

      if (!classData) {
        throw new Error('Class not found');
      }

      // Check if user is the instructor or admin
      if (classData.instructorId !== userId && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const invitedUsers = [];
      const failedEmails = [];

      for (const email of emails) {
        try {
          const user = await User.findOne({ where: { email } });
          
          if (user) {
            // Check if already enrolled
            const existingEnrollment = await ClassEnrollment.findOne({
              where: { classId, userId: user.id }
            });

            if (!existingEnrollment) {
              // Send invitation email
              await sendEmail({
                to: email,
                subject: `Invitation to Join: ${classData.name}`,
                html: `
                  <h2>Class Invitation</h2>
                  <p>You have been invited to join <strong>${classData.name}</strong> by ${classData.instructor.firstName} ${classData.instructor.lastName}.</p>
                  <p><strong>Enrollment Code:</strong> ${classData.enrollmentCode}</p>
                  ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                  <p>Log in to your account and use the enrollment code to join the class.</p>
                `
              });
              invitedUsers.push(email);
            }
          } else {
            failedEmails.push(email);
          }
        } catch (error) {
          failedEmails.push(email);
        }
      }

      return {
        message: 'Invitations sent successfully',
        invitedUsers,
        failedEmails
      };
    } catch (error) {
      console.error('Error sending invitations:', error);
      throw error;
    }
  }
}

module.exports = new ClassesService(); 