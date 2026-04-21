const pool = require('./config/db');
async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, table_name 
      FROM information_schema.columns 
      WHERE table_name IN ('students', 'instructors', 'users') 
      AND table_schema = 'public'
      ORDER BY table_name, column_name
    `);
    console.log('--- Full Columns Analysis ---');
    let currentTable = '';
    res.rows.forEach(r => {
      if (r.table_name !== currentTable) {
        currentTable = r.table_name;
        console.log(`\nTable: ${currentTable}`);
      }
      console.log(`  - ${r.column_name}`);
    });
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    process.exit(0);
  }
}
check();
