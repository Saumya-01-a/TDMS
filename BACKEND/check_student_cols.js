const pool = require('./config/db');
async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, is_nullable, column_default, data_type, ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    console.log('--- Students Column Detail ---');
    console.log('Total Columns:', res.rowCount);
    res.rows.forEach(r => {
      console.log(`${r.ordinal_position}. ${r.column_name} (${r.data_type}) [Nullable: ${r.is_nullable}, Default: ${r.column_default}]`);
    });
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    process.exit(0);
  }
}
check();
