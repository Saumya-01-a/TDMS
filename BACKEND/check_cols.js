const pool = require('./config/db');
async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log("COLUMNS:", res.rows.map(r => r.column_name).join(', '));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
