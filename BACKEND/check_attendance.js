const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '810111565',
  database: 'driving_school_db'
});

async function check() {
  try {
    const res = await pool.query("SELECT * FROM attendance LIMIT 1");
    if (res.rowCount > 0) {
      console.log('Keys in attendance table:');
      console.log(Object.keys(res.rows[0]));
    } else {
      const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'attendance'");
      console.log('Columns in attendance table:');
      console.log(cols.rows.map(r => r.column_name));
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
check();
