const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', host: 'localhost', database: 'driving_school_db', password: '810111565', port: 5432
});

const insId = 'I1769578441288'; // Saumya's ID

async function injectAttendance() {
  try {
    const studentsRes = await pool.query('SELECT student_id FROM students WHERE instructor_id = $1 LIMIT 8', [insId]);
    const students = studentsRes.rows;

    if (students.length === 0) {
      console.log("No students found for instructor", insId);
      return;
    }

    const marks = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    for (let i = 0; i < students.length; i++) {
        const studentId = students[i].student_id;
        // Inject 3 days of attendance for each student
        for (let day = 1; day <= 3; day++) {
            const date = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${(day + (i * 2)).toString().padStart(2, '0')}`;
            marks.push([
                studentId,
                insId,
                date,
                'Present',
                (day % 4) || 1,
                '08:00 AM - 10:00 AM'
            ]);
        }
    }

    console.log(`Injecting ${marks.length} records...`);

    for (const m of marks) {
        await pool.query(
            `INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT DO NOTHING`,
            m
        );
    }

    console.log('✅ Successfully injected attendance records.');

  } catch (err) {
    console.error("Injection error:", err);
  } finally {
    await pool.end();
  }
}

injectAttendance();
