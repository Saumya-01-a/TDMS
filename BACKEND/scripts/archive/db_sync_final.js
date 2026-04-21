const pool = require('./config/db');
async function run() {
  try {
    console.log("--- STARTING DATABASE SYNC ---");
    
    // 1. Update Users Table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
      ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT
    `);
    console.log("✅ Users table ensured.");

    // 2. Update Instructors Table
    await pool.query(`
      ALTER TABLE instructors 
      ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
      ADD COLUMN IF NOT EXISTS licence_no VARCHAR(50)
    `);
    console.log("✅ Instructors table ensured.");

    console.log("--- DATABASE SYNC COMPLETED ---");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  } finally {
    pool.end();
  }
}
run();
