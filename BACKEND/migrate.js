const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "migration.sql"), "utf8");
  try {
    console.log("Running migrations...");
    await pool.query(sql);
    console.log("✅ Migrations completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    process.exit(1);
  }
}

migrate();
