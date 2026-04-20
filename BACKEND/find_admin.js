const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'driving_school_db',
  password: '810111565',
  port: 5432,
});

async function findAdmin() {
  try {
    const res = await pool.query("SELECT user_id FROM users WHERE role = 'Admin' LIMIT 1");
    if (res.rows.length > 0) {
      console.log('ADMIN_ID:' + res.rows[0].user_id);
    } else {
      console.log('NO_ADMIN_FOUND');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

findAdmin();
