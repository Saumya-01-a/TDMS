const pool = require('./config/db');
async function check() {
  try {
    const students = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'students'`);
    const instructors = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'instructors'`);
    const lessons = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons' OR table_name = 'attendance'`);
    
    console.log('STUDENTS:', students.rows.map(r => r.column_name).join(', '));
    console.log('INSTRUCTORS:', instructors.rows.map(r => r.column_name).join(', '));
    console.log('LESSONS/ATTENDANCE:', lessons.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
