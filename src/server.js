// Server entry point
const db = require('./config/db');
async function testConnection(){
    try {
    const connection = await db.getConnection();
    console.log('Database connected successfully.');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}
testConnection();