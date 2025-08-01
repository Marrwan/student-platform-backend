const request = require('supertest');
const app = require('../server');
const { User, Project, Submission, Payment, Notification } = require('../models');
const jwt = require('jsonwebtoken');

describe('API Endpoints', () => {
  let adminToken, userToken, adminUser, regularUser;

  beforeAll(async () => {
    // Create test users
    adminUser = await User.create({
      id: 'test-admin-id',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'hashedpassword',
      role: 'admin',
      isActive: true
    });

    regularUser = await User.create({
      id: 'test-user-id',
      email: 'user@test.com',
      firstName: 'Regular',
      lastName: 'User',
      password: 'hashedpassword',
      role: 'student',
      isActive: true
    });

    // Generate tokens
    adminToken = jwt.sign({ id: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET || 'test-secret');
    userToken = jwt.sign({ id: regularUser.id, role: regularUser.role }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { id: [adminUser.id, regularUser.id] } });
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('GET /api/auth/me should return user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('Admin Endpoints', () => {
    test('GET /api/admin/stats should return admin statistics', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalSubmissions');
    });

    test('GET /api/admin/projects should return all projects', async () => {
      const response = await request(app)
        .get('/api/admin/projects')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/admin/submissions should return all submissions', async () => {
      const response = await request(app)
        .get('/api/admin/submissions')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('submissions');
    });

    test('GET /api/admin/users should return all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
    });

    test('GET /api/admin/assignments should return all assignments', async () => {
      const response = await request(app)
        .get('/api/admin/assignments')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assignments');
    });

    test('GET /api/admin/classes should return all classes', async () => {
      const response = await request(app)
        .get('/api/admin/classes')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('classes');
    });

    test('GET /api/admin/quick-submissions should return recent submissions', async () => {
      const response = await request(app)
        .get('/api/admin/quick-submissions')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Projects Endpoints', () => {
    test('GET /api/projects should return all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/projects/:id should return specific project', async () => {
      // Create a test project first
      const testProject = await Project.create({
        id: 'test-project-id',
        title: 'Test Project',
        description: 'Test Description',
        day: 1,
        difficulty: 'easy',
        maxScore: 100,
        deadline: new Date(),
        isUnlocked: true
      });

      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('project');

      // Clean up
      await testProject.destroy();
    });
  });

  describe('Submissions Endpoints', () => {
    test('GET /api/submissions/my should return user submissions', async () => {
      const response = await request(app)
        .get('/api/submissions/my')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('POST /api/submissions should create new submission', async () => {
      // Create a test project first
      const testProject = await Project.create({
        id: 'test-project-submit',
        title: 'Test Project for Submission',
        description: 'Test Description',
        day: 2,
        difficulty: 'easy',
        maxScore: 100,
        deadline: new Date(),
        isUnlocked: true
      });

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', `Bearer ${userToken}`)
        .field('projectId', testProject.id)
        .field('githubLink', 'https://github.com/test/repo');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('submission');

      // Clean up
      await testProject.destroy();
    });
  });

  describe('Leaderboard Endpoints', () => {
    test('GET /api/leaderboard should return leaderboard data', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/leaderboard/stats should return leaderboard statistics', async () => {
      const response = await request(app)
        .get('/api/leaderboard/stats')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
    });

    test('GET /api/leaderboard/streaks should return streak leaderboard', async () => {
      const response = await request(app)
        .get('/api/leaderboard/streaks')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Payments Endpoints', () => {
    test('GET /api/payments/admin/all should return all payments (admin)', async () => {
      const response = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/payments/stats should return payment statistics (admin)', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalPayments');
    });

    test('GET /api/payments/history should return user payment history', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('payments');
    });
  });

  describe('Notifications Endpoints', () => {
    test('GET /api/notifications should return user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
    });

    test('POST /api/notifications should create notification', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'info',
          title: 'Test Notification',
          content: 'Test content',
          targetUserId: regularUser.id
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('notification');
    });

    test('PATCH /api/notifications/:id/read should mark notification as read', async () => {
      // Create a test notification first
      const testNotification = await Notification.create({
        id: 'test-notification-id',
        userId: regularUser.id,
        type: 'info',
        title: 'Test',
        content: 'Test content',
        isRead: false
      });

      const response = await request(app)
        .patch(`/api/notifications/${testNotification.id}/read`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notification');

      // Clean up
      await testNotification.destroy();
    });
  });

  describe('Dashboard Endpoints', () => {
    test('GET /api/dashboard/today-project should return today\'s project', async () => {
      const response = await request(app)
        .get('/api/dashboard/today-project')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('project');
    });

    test('GET /api/dashboard/recent-submissions should return recent submissions', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-submissions')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('submissions');
    });

    test('GET /api/dashboard/progress-stats should return progress statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/progress-stats')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
    });
  });

  describe('Error Handling', () => {
    test('Should return 401 for unauthorized requests', async () => {
      const response = await request(app).get('/api/admin/stats');
      expect(response.status).toBe(401);
    });

    test('Should return 403 for insufficient permissions', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
    });

    test('Should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(404);
    });
  });
}); 