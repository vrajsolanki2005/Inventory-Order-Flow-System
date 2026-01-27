const User = require('./src/models/userModel');
const db = require('./src/config/db');

async function runTests() {
  try {
    console.log('--- Starting Model Tests ---');

    // 1. Test "Create User" (Hashing is handled inside the model)
    console.log('Testing: Create User...');
    const newUser = await User.createUser({
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'mypassword123'
    });
    console.log('✅ User created! ID:', newUser.insertId);

    // 2. Test "Find User by Email"
    console.log('Testing: Find User by Email...');
    const user = await User.findUserByEmail('test@example.com');
    
    if (user) {
      console.log('✅ User found:', user.username);
      console.log('🔒 Hashed Password in DB:', user.password);
    } else {
      console.log('❌ User not found.');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    // Close the connection pool so the script exits
    process.exit();
  }
}

runTests();