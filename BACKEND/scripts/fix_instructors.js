const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '810111565',
  database: process.env.DB_NAME || 'driving_school_db',
});

async function fixInstructors() {
  try {
    console.log('🚀 Starting Instructor Activation Audit...');
    
    // 1. Target the specific user
    const res1 = await pool.query("UPDATE users SET status = 'active' WHERE email = 'saumyageethanath1@gmail.com'");
    console.log(`✅ User saumyageethanath1@gmail.com status updated to 'active' (${res1.rowCount} rows)`);

    // 2. Audit/Activate legacy approved instructors
    const res2 = await pool.query(`
      UPDATE users u 
      SET status = 'active' 
      FROM instructors i 
      WHERE u.user_id = i.user_id 
      AND u.role = 'Instructor' 
      AND i.approval_status = 'approved' 
      AND u.status != 'active'
    `);
    console.log(`✅ Activated ${res2.rowCount} other legacy instructors.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during activation:', err.message);
    process.exit(1);
  }
}

fixInstructors();
