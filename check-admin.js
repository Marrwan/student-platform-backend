const { User } = require('./models');

async function checkAdmin() {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      console.log('Admin found:');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
    } else {
      console.log('No admin user found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin(); 