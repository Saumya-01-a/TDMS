const pool = require('./config/db');

async function migrate() {
  try {
    console.log('--- GPS System Migration ---');
    
    // 🗺️ GPS Routes Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gps_routes (
        id SERIAL PRIMARY KEY,
        instructor_id VARCHAR(50) NOT NULL,
        vehicle_id INTEGER NOT NULL,
        route_name VARCHAR(100),
        route_points JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ gps_routes table created');

    // 📍 GPS Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gps_logs (
        id SERIAL PRIMARY KEY,
        instructor_id VARCHAR(50),
        vehicle_id INTEGER,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        speed INTEGER,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ gps_logs table created');

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('❌ Migration FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
