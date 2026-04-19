const pool = require('./BACKEND/config/db');

async function check() {
  try {
    const res = await pool.query(`
      SELECT u.email, u.role, u.status, i.approval_status as instructor_approval
      FROM users u
      LEFT JOIN instructors i ON u.user_id = i.user_id
      LIMIT 10
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
