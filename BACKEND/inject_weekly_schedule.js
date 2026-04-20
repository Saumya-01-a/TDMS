const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', host: 'localhost', database: 'driving_school_db', password: '810111565', port: 5432
});

const insId = 'I1769578441288'; // Saumya's ID

async function injectSchedule() {
  try {
    const studentsRes = await pool.query('SELECT student_id FROM students WHERE instructor_id = $1 LIMIT 5', [insId]);
    const students = studentsRes.rows;

    if (students.length === 0) {
      console.log("No students found for instructor", insId);
      const allStudentsRes = await pool.query('SELECT student_id FROM students LIMIT 5');
      if (allStudentsRes.rows.length > 0) {
          console.log("Using general students for demo...");
          students.push(...allStudentsRes.rows);
      } else {
          return;
      }
    }

    const sessions = [];
    const today = new Date();
    
    // Generate sessions for the next 7 days
    for (let i = 0; i < 7; i++) {
        const sessionDate = new Date();
        sessionDate.setDate(today.getDate() + i);
        const dateStr = sessionDate.toISOString().split('T')[0];
        
        // Add 1-2 sessions per day
        const numSessions = (i % 2) + 1;
        for (let j = 0; j < numSessions; j++) {
            const student = students[(i + j) % students.length];
            const slot = (j % 4) + 1;
            sessions.push([
                student.student_id,
                insId,
                dateStr,
                slot,
                'Booked'
            ]);
        }
    }

    console.log(`Injecting ${sessions.length} schedule records...`);

    for (const s of sessions) {
        await pool.query(
            `INSERT INTO lessons (student_id, instructor_id, lesson_date, session_number, status, vehicle_id) 
             VALUES ($1, $2, $3, $4, $5, 1) 
             ON CONFLICT (instructor_id, lesson_date, session_number) DO NOTHING`,
            s
        );
    }

    console.log('✅ Weekly schedule populated for April 2026.');

  } catch (err) {
    console.error("Schedule Injection error:", err);
  } finally {
    await pool.end();
  }
}

injectSchedule();
