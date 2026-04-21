const pool = require('./config/db');

async function findAdmins() {
  try {
    const res = await pool.query("SELECT user_id, first_name, last_name, role FROM users WHERE role = 'Admin'");
    console.log('--- ADMIN USERS ---');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findAdmins();
