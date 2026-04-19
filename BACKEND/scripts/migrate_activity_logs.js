const pool = require("../config/db");

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting Activity Log Migration...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Table 'activity_logs' created successfully.");

    // Add some initial logs if empty
    const checkLogs = await client.query("SELECT count(*) FROM activity_logs");
    if (parseInt(checkLogs.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO activity_logs (message, type) VALUES 
        ('System initialized with activity tracking', 'info'),
        ('Admin dashboard redesign phase started', 'info')
      `);
      console.log("📝 Initial logs seeded.");
    }

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    client.release();
    process.exit();
  }
};

migrate();
