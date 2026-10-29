const pool = require('../BACKEND/config/db');

async function test() {
  try {
    const dates = await pool.query(`
      SELECT DISTINCT attendance_date, count(*) 
      FROM attendance 
      GROUP BY attendance_date 
      ORDER BY attendance_date DESC;
    `);
    console.log('Attendance dates:\n', dates.rows);

    const oct2026 = await pool.query(`
      SELECT count(*) 
      FROM attendance 
      WHERE EXTRACT(MONTH FROM attendance_date) = 10 
        AND EXTRACT(YEAR FROM attendance_date) = 2026;
    `);
    console.log('October 2026 records count:', oct2026.rows[0]);
  } catch(err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
test();
