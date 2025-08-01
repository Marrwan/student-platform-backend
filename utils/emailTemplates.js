const emailTemplates = {
  // Account activation
  accountActivation: (user, activationCode) => ({
    subject: 'Welcome to Learning Platform - Activate Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Learning Platform!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Activate your account to start your learning journey</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with our Learning Platform. To complete your registration and start accessing our courses and projects, please activate your account.
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Your Activation Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0;">
              ${activationCode}
            </div>
            <p style="color: #666; font-size: 14px;">Enter this code on the activation page to verify your account</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${activationCode}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Activate Account
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all;">
            ${process.env.FRONTEND_URL}/verify-email?token=${activationCode}
          </p>
          
          <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>Note:</strong> This activation code will expire in 24 hours. If you don't activate your account within this time, you'll need to request a new activation code.
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    `
  }),

  // Password reset
  passwordReset: (user, resetToken) => ({
    subject: 'Reset Your Password - Learning Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure your account with a new password</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Learning Platform account. If you made this request, please use the link below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #ff6b6b; word-break: break-all;">
            ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">For security reasons, this link will expire in 1 hour.</p>
        </div>
      </div>
    `
  }),

  // New project notification
  newProject: (user, project) => ({
    subject: `New Project Available: ${project.title} - Day ${project.day}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Project Unlocked! 🚀</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Day ${project.day} of your learning journey</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Great news! A new project has been unlocked for you. It's time to continue your JavaScript learning journey!
          </p>
          
          <div style="background: white; border: 2px solid #4ecdc4; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">${project.title}</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${project.description}</p>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #4ecdc4;">${project.difficulty}</div>
                <div style="font-size: 12px; color: #666;">Difficulty</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #4ecdc4;">${project.maxScore}</div>
                <div style="font-size: 12px; color: #666;">Max Score</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #4ecdc4;">${project.deadline}</div>
                <div style="font-size: 12px; color: #666;">Deadline</div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/projects/${project.id}" 
               style="background: #4ecdc4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Start Project
            </a>
          </div>
          
          <div style="background: #e8f5e8; border-left: 4px solid #4ecdc4; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d; font-size: 14px;">
              <strong>Tip:</strong> Submit your project before the deadline to avoid late penalties. You can submit via GitHub link, code paste, or ZIP upload.
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">Keep up the great work! 💪</p>
        </div>
      </div>
    `
  }),

  // Deadline reminder
  deadlineReminder: (user, project) => ({
    subject: `⚠️ Deadline Reminder: ${project.title} - Due Soon!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Deadline Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your project is due soon!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder that your project deadline is approaching. Don't miss out on earning full points!
          </p>
          
          <div style="background: white; border: 2px solid #ff9a56; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">${project.title}</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${project.description}</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 10px;">⏰</span>
                <span style="font-weight: bold; color: #856404;">Deadline: ${project.deadline}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 10px;">💰</span>
                <span style="color: #856404;">Late fee: ₦${project.lateFee}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/projects/${project.id}" 
               style="background: #ff9a56; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Submit Now
            </a>
          </div>
          
          <div style="background: #ffe6e6; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #721c24; font-size: 14px;">
              <strong>Important:</strong> Submissions after the deadline will incur a late fee of ₦${project.lateFee}. Submit early to avoid penalties!
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">You've got this! 🚀</p>
        </div>
      </div>
    `
  }),

  // Project feedback
  projectFeedback: (user, submission) => ({
    subject: `Feedback on ${submission.projectTitle} - Your Project Has Been Reviewed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📝 Project Feedback</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your project has been reviewed</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your project has been reviewed by our instructors. Here's your feedback and score:
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">${submission.projectTitle}</h3>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${submission.score}</div>
                <div style="font-size: 12px; color: #666;">Score</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${submission.maxScore}</div>
                <div style="font-size: 12px; color: #666;">Max Score</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${submission.status}</div>
                <div style="font-size: 12px; color: #666;">Status</div>
              </div>
            </div>
            
            ${submission.feedback ? `
              <div style="background: #f8f9fa; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 10px;">Instructor Feedback:</h4>
                <p style="color: #666; line-height: 1.6; margin: 0;">${submission.feedback}</p>
              </div>
            ` : ''}
            
            ${submission.bonusPoints > 0 ? `
              <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 10px; margin: 10px 0;">
                <span style="color: #28a745; font-weight: bold;">+${submission.bonusPoints} bonus points</span>
              </div>
            ` : ''}
            
            ${submission.penaltyPoints > 0 ? `
              <div style="background: #ffe6e6; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0;">
                <span style="color: #dc3545; font-weight: bold;">-${submission.penaltyPoints} penalty points</span>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Details
            </a>
          </div>
          
          <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>Keep Learning:</strong> Use this feedback to improve your skills. Every project is a step forward in your learning journey!
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">Great work! Keep it up! 🎉</p>
        </div>
      </div>
    `
  }),

  // Class invitation
  classInvitation: (user, classData, invitationCode) => ({
    subject: `You're Invited to Join: ${classData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎓 Class Invitation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Join your classmates in learning</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You've been invited to join a class on our Learning Platform. This is a great opportunity to learn alongside your peers!
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">${classData.name}</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${classData.description}</p>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${classData.level}</div>
                <div style="font-size: 12px; color: #666;">Level</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${classData.currentStudents}</div>
                <div style="font-size: 12px; color: #666;">Students</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${classData.assignments}</div>
                <div style="font-size: 12px; color: #666;">Projects</div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/classes/join?code=${invitationCode}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Join Class
            </a>
          </div>
          
          <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d; font-size: 14px;">
              <strong>Benefits:</strong> Join this class to access exclusive assignments, track your progress, and compete with classmates on the leaderboard!
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">Welcome to the class! 📚</p>
        </div>
      </div>
    `
  }),

  // Welcome email
  welcomeEmail: (user) => ({
    subject: 'Welcome to Learning Platform - Start Your Journey!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Learning Platform!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your learning journey starts now</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Learning Platform! We're excited to have you join our community of learners. You're about to embark on an amazing journey of skill development and growth.
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Complete your profile to personalize your experience</li>
              <li>Browse available projects and start learning</li>
              <li>Join classes to learn with others</li>
              <li>Track your progress and compete on leaderboards</li>
              <li>Earn certificates and build your portfolio</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Get Started
            </a>
          </div>
          
          <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>Need Help?</strong> Our support team is here to help you succeed. Don't hesitate to reach out if you have any questions!
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Learning Platform. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">Happy learning! 🚀</p>
        </div>
      </div>
    `
  })
};

module.exports = emailTemplates; 