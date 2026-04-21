const pool = require('./config/db');
async function run() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE email = 'saumyageethanath1@gmail.com'");
    console.log("USER_FOUND:", !!res.rows[0]);
    if (res.rows[0]) {
      console.log("USER_ID:", res.rows[0].user_id);
      const ins = await pool.query("SELECT * FROM instructors WHERE user_id = $1", [res.rows[0].user_id]);
      console.log("INSTRUCTOR_FOUND:", !!ins.rows[0]);
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
