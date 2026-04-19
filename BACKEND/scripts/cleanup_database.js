const { Pool } = require('pg');
require('dotenv').config();

/**
 * 🛠️ EMERGENCY DATABASE CLEANUP SCRIPT
 * This script attempts to terminate all active connections to the database except itself.
 * Use this if you encounter "sorry, too many clients already".
 */

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
});

async function cleanup() {
  console.log("🧹 Starting Database Cleanup...");
  
  try {
    // 1. Get current connections count
    const countRes = await pool.query("SELECT count(*) FROM pg_stat_activity WHERE datname = $1", [process.env.DB_NAME]);
    console.log(`📊 Current connections for '${process.env.DB_NAME}': ${countRes.rows[0].count}`);

    // 2. Terminate all other backends
    // Note: Requires superuser or the same user that started the backends
    const terminateRes = await pool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
      AND pid <> pg_backend_pid();
    `, [process.env.DB_NAME]);

    console.log(`✅ Successfully requested termination of ${terminateRes.rowCount} ghost connections.`);
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    if (err.message.includes("too many clients")) {
      console.log("⚠️ DB is totally full. Try waiting 60 seconds for idle connections to drop, or restart the PostgreSQL service manually.");
    }
  } finally {
    await pool.end();
    console.log("🏁 Cleanup process complete.");
  }
}

cleanup();
