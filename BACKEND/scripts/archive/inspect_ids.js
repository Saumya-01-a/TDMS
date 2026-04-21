const pool = require('./config/db');

async function inspect() {
  try {
    const tables = ['gps_logs', 'instructors', 'users', 'vehicles'];
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ANY($1)
      AND (column_name LIKE '%id' OR column_name LIKE '%user%')
      ORDER BY table_name, column_name;
    `, [tables]);
    
    console.log('--- DATABASE ID SCHEMA ---');
    res.rows.forEach(r => {
      console.log(`${r.table_name}.${r.column_name}: ${r.data_type}`);
    });
    
    // Also check one row from users to see what user_id looks like
    const userSample = await pool.query('SELECT user_id FROM users LIMIT 1');
    console.log('\n--- SAMPLE user_id ---');
    console.log(userSample.rows[0]);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
