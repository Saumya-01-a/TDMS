const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10, // 🛡️ Slightly increased but still conservative
  idleTimeoutMillis: 5000, // 🕒 release idle clients after 5 seconds
  connectionTimeoutMillis: 10000, // 🕒 wait 10s for a connection before failing
  allowExitOnIdle: true // 🔌 allow the process to exit if only idle clients remain
});

pool.on('error', (err) => {
  console.error('⚠️ [Pool Error]:', err.message);
});

pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL database");
    client.release();
  })
  .catch(err => {
    console.error("❌ PostgreSQL connection error:", err.message);
  });

module.exports = pool;
