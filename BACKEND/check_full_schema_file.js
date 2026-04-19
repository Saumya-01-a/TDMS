const pool = require('./config/db');
const fs = require('fs');
async function check() {
  try {
    const students = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'students'`);
    const instructors = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'instructors'`);
    const attendance = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'attendance'`);
    
    fs.writeFileSync('schema_info.txt', 
      'STUDENTS: ' + students.rows.map(r => r.column_name).join(', ') + '\n' +
      'INSTRUCTORS: ' + instructors.rows.map(r => r.column_name).join(', ') + '\n' +
      'ATTENDANCE: ' + attendance.rows.map(r => r.column_name).join(', ')
    );
  } catch (err) {
    fs.writeFileSync('schema_info.txt', err.toString());
  } finally {
    process.exit(0);
  }
}
check();
