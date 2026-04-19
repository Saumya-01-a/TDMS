const pool = require('./config/db');
async function run() {
  try {
    const uRes = await pool.query("SELECT * FROM users LIMIT 1");
    console.log("USERS_COLS:", Object.keys(uRes.rows[0] || {}).join(', '));
    const iRes = await pool.query("SELECT * FROM instructors LIMIT 1");
    console.log("INSTRUCTORS_COLS:", Object.keys(iRes.rows[0] || {}).join(', '));
  } catch (err) {
    console.log("ERROR_DURING_CHECK:", err.message);
  } finally {
    pool.end();
  }
}
run();
