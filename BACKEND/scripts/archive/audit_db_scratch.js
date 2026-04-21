const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'driving_school_db',
  password: '810111565',
  port: 5432,
});

async function auditAssignments() {
  try {
    console.log("--- Instructors ---");
    const insRes = await pool.query(`
      SELECT i.instructor_id, u.first_name, u.last_name, u.user_id
      FROM instructors i
      JOIN users u ON i.user_id = u.user_id
    `);
    console.table(insRes.rows);

    console.log("\n--- Students Count by Instructor ---");
    const countRes = await pool.query(`
      SELECT instructor_id, COUNT(*) 
      FROM students 
      GROUP BY instructor_id
    `);
    console.table(countRes.rows);

    console.log("\n--- Unassigned Students (Top 5) ---");
    const unassignedRes = await pool.query(`
      SELECT s.student_id, u.first_name, u.last_name 
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.instructor_id IS NULL OR s.instructor_id = 'INST-DEFAULT'
      LIMIT 5
    `);
    console.table(unassignedRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

auditAssignments();
