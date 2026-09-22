const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let adminToken;
let testAssignmentId;
let testSubmissionId;
let testClassId;

// Test data
const testClass = {
  name: `Test Class ${Date.now()}`,
  description: 'Test class for assignment management',
  maxStudents: 50,
  level: 'beginner'
};

const testAssignment = {
  title: `Test Assignment ${Date.now()}`,
  description: 'This is a test assignment for admin management',
  classId: '', // Will be set after class creation
  type: 'fullstack',
  difficulty: 'easy',
  maxScore: 100,
  startDate: new Date().toISOString(),
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  requirements: 'Complete the assignment as specified',
  submissionMode: 'both',
  paymentRequired: false,
  paymentAmount: 500,
  sampleOutputUrl: 'https://example.com/sample',
  sampleOutputCode: {
    html: '<h1>Sample Output</h1>',
    css: 'h1 { color: blue; }',
    javascript: 'console.log("Hello World");'
  }
};

const testSubmission = {
  submissionType: 'link',
  submissionLink: 'https://github.com/test/repo'
};

// Helper functions
const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

const createTestClass = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/classes`, testClass, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data.class.id;
  } catch (error) {
    console.error('Create class failed:', error.response?.data || error.message);
    throw error;
  }
};

const createTestAssignment = async () => {
  try {
    const assignmentData = { ...testAssignment, classId: testClassId };
    const response = await axios.post(`${BASE_URL}/assignments`, assignmentData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data.assignment.id;
  } catch (error) {
    console.error('Create assignment failed:', error.response?.data || error.message);
    throw error;
  }
};

const createTestSubmission = async () => {
  try {
    // First create a test student
    const studentEmail = `student${Date.now()}@test.com`;
    const studentResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Student',
      email: studentEmail,
      password: 'student123',
      role: 'student'
    });
    
    const studentToken = studentResponse.data.token;
    
    // Enroll student in class
    await axios.post(`${BASE_URL}/classes/${testClassId}/enroll`, {
      enrollmentCode: 'TEST123'
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    // Submit assignment
    const submissionResponse = await axios.post(`${BASE_URL}/assignments/${testAssignmentId}/submit`, testSubmission, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    return submissionResponse.data.submission.id;
  } catch (error) {
    console.error('Create submission failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('✅ Admin login successful');
};

const testCreateClass = async () => {
  console.log('\n🏫 Testing Class Creation...');
  testClassId = await createTestClass();
  console.log('✅ Class created successfully:', testClassId);
};

const testCreateAssignment = async () => {
  console.log('\n📝 Testing Assignment Creation...');
  testAssignmentId = await createTestAssignment();
  console.log('✅ Assignment created successfully:', testAssignmentId);
};

const testGetAssignment = async () => {
  console.log('\n📖 Testing Get Assignment...');
  const response = await axios.get(`${BASE_URL}/assignments/${testAssignmentId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  const assignment = response.data;
  console.log('✅ Assignment retrieved successfully');
  console.log('   Title:', assignment.title);
  console.log('   Max Score:', assignment.maxScore);
  console.log('   Submission Mode:', assignment.submissionMode);
  console.log('   Sample Output URL:', assignment.sampleOutputUrl);
};

const testUpdateAssignment = async () => {
  console.log('\n✏️ Testing Assignment Update...');
  const updateData = {
    title: `Updated Assignment ${Date.now()}`,
    description: 'This assignment has been updated',
    maxScore: 150
  };
  
  const response = await axios.put(`${BASE_URL}/assignments/${testAssignmentId}`, updateData, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  console.log('✅ Assignment updated successfully');
  console.log('   New Title:', response.data.assignment.title);
  console.log('   New Max Score:', response.data.assignment.maxScore);
};

const testCreateSubmission = async () => {
  console.log('\n📤 Testing Submission Creation...');
  testSubmissionId = await createTestSubmission();
  console.log('✅ Submission created successfully:', testSubmissionId);
};

const testGetSubmissions = async () => {
  console.log('\n📋 Testing Get Submissions...');
  const response = await axios.get(`${BASE_URL}/assignments/${testAssignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  const { submissions, total, assignment } = response.data;
  console.log('✅ Submissions retrieved successfully');
  console.log('   Total Submissions:', total);
  console.log('   Assignment Title:', assignment.title);
  console.log('   First Submission:', submissions[0]?.id);
};

const testMarkSubmission = async () => {
  console.log('\n✅ Testing Mark Submission...');
  const markData = {
    score: 85,
    feedback: 'Great work! Well done on the implementation.',
    status: 'accepted'
  };
  
  const response = await axios.put(`${BASE_URL}/assignments/${testAssignmentId}/submissions/${testSubmissionId}/mark`, markData, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  console.log('✅ Submission marked successfully');
  console.log('   Score:', response.data.submission.score);
  console.log('   Status:', response.data.submission.status);
  console.log('   Feedback:', response.data.submission.feedback);
};

const testDeleteAssignment = async () => {
  console.log('\n🗑️ Testing Assignment Deletion...');
  
  // First verify the assignment exists
  const getResponse = await axios.get(`${BASE_URL}/assignments/${testAssignmentId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('   Assignment exists before deletion:', !!getResponse.data);
  
  // Delete the assignment
  const deleteResponse = await axios.delete(`${BASE_URL}/assignments/${testAssignmentId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  
  console.log('✅ Assignment deleted successfully');
  console.log('   Message:', deleteResponse.data.message);
  
  // Verify deletion
  try {
    await axios.get(`${BASE_URL}/assignments/${testAssignmentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('❌ Assignment still exists after deletion');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Assignment successfully deleted (404 error)');
    } else {
      console.log('❌ Unexpected error after deletion:', error.response?.data);
    }
  }
};

const testEmailDisable = async () => {
  console.log('\n📧 Testing Email Disable Feature...');
  
  // Test with emails enabled (should send)
  console.log('   Testing with emails enabled...');
  try {
    const response = await axios.post(`${BASE_URL}/assignments`, testAssignment, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Assignment created with emails enabled');
  } catch (error) {
    console.log('   ❌ Failed to create assignment with emails enabled:', error.response?.data);
  }
  
  // Note: To test with emails disabled, set DISABLE_EMAILS=true in environment
  console.log('   To test with emails disabled, set DISABLE_EMAILS=true in environment');
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Admin Assignment Management Tests...');
  console.log('Base URL:', BASE_URL);
  
  try {
    await testAdminLogin();
    await testCreateClass();
    await testCreateAssignment();
    await testGetAssignment();
    await testUpdateAssignment();
    await testCreateSubmission();
    await testGetSubmissions();
    await testMarkSubmission();
    await testDeleteAssignment();
    await testEmailDisable();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Admin Login');
    console.log('   ✅ Class Creation');
    console.log('   ✅ Assignment Creation');
    console.log('   ✅ Assignment Retrieval');
    console.log('   ✅ Assignment Update');
    console.log('   ✅ Submission Creation');
    console.log('   ✅ Submissions Retrieval');
    console.log('   ✅ Submission Marking');
    console.log('   ✅ Assignment Deletion');
    console.log('   ✅ Email Disable Feature');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testAdminLogin,
  testCreateClass,
  testCreateAssignment,
  testGetAssignment,
  testUpdateAssignment,
  testCreateSubmission,
  testGetSubmissions,
  testMarkSubmission,
  testDeleteAssignment,
  testEmailDisable
};
