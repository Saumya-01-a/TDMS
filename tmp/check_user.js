const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), 'BACKEND', '.env') });
const pool = require(path.join(process.cwd(), 'BACKEND', 'config', 'db'));

async function checkUser() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE email = 'saumyageethanath1@gmail.com'");
    console.log("User:", res.rows[0]);
    if (res.rows[0]) {
        const ins = await pool.query("SELECT * FROM instructors WHERE user_id = $1", [res.rows[0].user_id]);
        console.log("Instructor record:", ins.rows[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkUser();
