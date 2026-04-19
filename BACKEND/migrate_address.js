const pool = require('./config/db');
async function migrate() {
  try {
    console.log("Starting database migration...");
    
    // 1. Update Users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
      ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT
    `);
    console.log("✅ Users table updated with address columns.");

    // 2. Update Instructors table
    await pool.query(`
      ALTER TABLE instructors 
      ADD COLUMN IF NOT EXISTS licence_no VARCHAR(50)
    `);
    console.log("✅ Instructors table updated with licence_no.");

    // 3. Backfill data for the current test user if needed
    // In a real scenario, we might want to migrate existing student addresses to users table
    // For now, we ensure the missing columns don't crash the query.

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    pool.end();
  }
}
migrate();
