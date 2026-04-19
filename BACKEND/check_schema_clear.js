const pool = require('./config/db');
async function run() {
  try {
    const uRes = await pool.query("SELECT * FROM users LIMIT 1");
    console.log("--- USERS COLUMNS ---");
    Object.keys(uRes.rows[0] || {}).forEach(k => console.log(k));
    
    const iRes = await pool.query("SELECT * FROM instructors LIMIT 1");
    console.log("--- INSTRUCTORS COLUMNS ---");
    Object.keys(iRes.rows[0] || {}).forEach(k => console.log(k));
  } catch (err) {
    console.log("ERROR:", err.message);
  } finally {
    pool.end();
  }
}
run();
