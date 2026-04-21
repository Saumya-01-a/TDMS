const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '810111565',
  database: process.env.DB_NAME || 'driving_school_db',
});

async function migrate() {
  try {
    console.log('🚀 Migrating notifications table...');
    
    await pool.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS recipient_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sender_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'info'
    `);

    // Backfill recipient_id from instructor_id if it exists
    await pool.query("UPDATE notifications SET recipient_id = instructor_id WHERE recipient_id IS NULL AND instructor_id IS NOT NULL");

    console.log('✅ Migration successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
