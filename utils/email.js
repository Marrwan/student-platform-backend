const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Learning Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Learning Platform!</h2>
        <p>Hello ${userName},</p>
        <p>Welcome to our comprehensive learning platform! We're excited to have you on board.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Join classes using enrollment codes</li>
          <li>Complete daily assignments</li>
          <li>Track your progress</li>
          <li>Compete on leaderboards</li>
        </ul>
        <p>Get started by logging into your dashboard!</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested a password reset for your Learning Platform account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  newAssignment: (assignmentTitle, className, deadline) => ({
    subject: `New Assignment: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Assignment Available</h2>
        <p>A new assignment has been created for your class.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
        </div>
        <p>Log in to your dashboard to view the full assignment details and submit your work.</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  assignmentUnlocked: (assignmentTitle, className, deadline) => ({
    subject: `Assignment Unlocked: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Assignment Now Available</h2>
        <p>The assignment is now unlocked and ready for submission!</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
        </div>
        <p>Start working on your assignment now!</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  assignmentReviewed: (assignmentTitle, className, status, score, maxScore, feedback) => ({
    subject: `Assignment Reviewed: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Assignment Review Complete</h2>
        <p>Your assignment has been reviewed by your instructor.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Score:</strong> ${score}/${maxScore}</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
        </div>
        <p>Log in to your dashboard to view the full review.</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  classInvitation: (className, instructorName, enrollmentCode, message) => ({
    subject: `Invitation to Join: ${className}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Class Invitation</h2>
        <p>You have been invited to join <strong>${className}</strong> by ${instructorName}.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Enrollment Code:</strong> ${enrollmentCode}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        </div>
        <p>Log in to your account and use the enrollment code to join the class.</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  newStudentEnrolled: (studentName, studentEmail, className) => ({
    subject: `New Student Enrolled: ${className}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Student Enrollment</h2>
        <p>A new student has enrolled in your class.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Enrolled:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  lateSubmission: (assignmentTitle, className, lateFee) => ({
    subject: `Late Submission: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Late Submission Notice</h2>
        <p>Your assignment was submitted after the deadline.</p>
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
          <p><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Late Fee:</strong> ₦${lateFee}</p>
        </div>
        <p>Please complete the payment to avoid further penalties.</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  }),

  reminder: (assignmentTitle, className, deadline) => ({
    subject: `Reminder: ${assignmentTitle} - Due Soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Assignment Due Soon</h2>
        <p>This is a friendly reminder about your upcoming assignment deadline.</p>
        <div style="background-color: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
        </div>
        <p>Don't forget to submit your work on time!</p>
        <p>Best regards,<br>The Learning Platform Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping email send:', { to, subject });
      return { success: true, message: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send email with template
const sendTemplateEmail = async (templateName, to, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  const emailData = typeof template === 'function' ? template(data) : template;
  return await sendEmail({
    to,
    subject: emailData.subject,
    html: emailData.html
  });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  return await sendTemplateEmail('welcome', user.email, user.firstName);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetLink) => {
  return await sendTemplateEmail('passwordReset', user.email, resetLink);
};

// Send new assignment notification
const sendNewAssignmentEmail = async (user, assignment, className) => {
  return await sendTemplateEmail('newAssignment', user.email, {
    assignmentTitle: assignment.title,
    className,
    deadline: assignment.deadline
  });
};

// Send assignment unlocked notification
const sendAssignmentUnlockedEmail = async (user, assignment, className) => {
  return await sendTemplateEmail('assignmentUnlocked', user.email, {
    assignmentTitle: assignment.title,
    className,
    deadline: assignment.deadline
  });
};

// Send assignment reviewed notification
const sendAssignmentReviewedEmail = async (user, assignment, className, submission) => {
  return await sendTemplateEmail('assignmentReviewed', user.email, {
    assignmentTitle: assignment.title,
    className,
    status: submission.status,
    score: submission.score,
    maxScore: assignment.maxScore,
    feedback: submission.adminFeedback
  });
};

// Send class invitation
const sendClassInvitationEmail = async (user, className, instructorName, enrollmentCode, message) => {
  return await sendTemplateEmail('classInvitation', user.email, {
    className,
    instructorName,
    enrollmentCode,
    message
  });
};

// Send new student enrolled notification
const sendNewStudentEnrolledEmail = async (instructor, student, className) => {
  return await sendTemplateEmail('newStudentEnrolled', instructor.email, {
    studentName: `${student.firstName} ${student.lastName}`,
    studentEmail: student.email,
    className
  });
};

// Send late submission notification
const sendLateSubmissionEmail = async (user, assignment, className, lateFee) => {
  return await sendTemplateEmail('lateSubmission', user.email, {
    assignmentTitle: assignment.title,
    className,
    lateFee
  });
};

// Send reminder email
const sendReminderEmail = async (user, assignment, className) => {
  return await sendTemplateEmail('reminder', user.email, {
    assignmentTitle: assignment.title,
    className,
    deadline: assignment.deadline
  });
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewAssignmentEmail,
  sendAssignmentUnlockedEmail,
  sendAssignmentReviewedEmail,
  sendClassInvitationEmail,
  sendNewStudentEnrolledEmail,
  sendLateSubmissionEmail,
  sendReminderEmail,
  emailTemplates
}; 