const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'driving_school_db',
  password: '810111565',
  port: 5432,
});

async function audit() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payments'
    `);
    console.log('--- PAYMENTS TABLE SCHEMA ---');
    console.table(res.rows);
    
    const count = await pool.query("SELECT count(*) FROM payments");
    console.log('Total Payments:', count.rows[0].count);
    
    const sample = await pool.query("SELECT * FROM payments LIMIT 3");
    console.log('--- SAMPLE DATA ---');
    console.table(sample.rows);
  } catch (err) {
    console.error('Audit Error:', err.message);
  } finally {
    await pool.end();
  }
}

audit();
