const pool = require('./config/db');
async function run() {
  try {
    const res = await pool.query("UPDATE students SET instructor_id = 'I1769578441288L'");
    console.log(`Updated ${res.rowCount} students`);
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    process.exit(0);
  }
}
run();
