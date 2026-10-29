const pool = require('../BACKEND/config/db');

async function seed() {
  try {
    const students = await pool.query('SELECT student_id FROM students LIMIT 10;');
    console.log('Students:', students.rows);

    const instructors = await pool.query('SELECT instructor_id FROM instructors LIMIT 5;');
    console.log('Instructors:', instructors.rows);

    const defaultIns = instructors.rows[0]?.instructor_id || 'SYSTEM_ADMIN';

    // Seed for October 2026
    const sampleDates = [
      { day: '02', status: 'Present', session: 1, slot: '08:00 AM - 10:00 AM' },
      { day: '05', status: 'Present', session: 2, slot: '10:00 AM - 12:00 PM' },
      { day: '09', status: 'Late', session: 1, slot: '08:00 AM - 10:00 AM' },
      { day: '14', status: 'Present', session: 3, slot: '01:00 PM - 03:00 PM' },
      { day: '19', status: 'Absent', session: 1, slot: null },
      { day: '23', status: 'Present', session: 2, slot: '10:00 AM - 12:00 PM' },
      { day: '28', status: 'Present', session: 4, slot: '03:00 PM - 05:00 PM' }
    ];

    let inserted = 0;
    for (const s of students.rows) {
      for (const d of sampleDates) {
        const dateStr = `2026-10-${d.day}`;
        // Check if exists
        const exists = await pool.query(
          'SELECT id FROM attendance WHERE student_id = $1 AND attendance_date = $2',
          [s.student_id, dateStr]
        );
        if (exists.rowCount === 0) {
          await pool.query(
            `INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [s.student_id, defaultIns, dateStr, d.status, d.session, d.slot]
          );
          inserted++;
        }
      }
    }
    console.log(`✅ Seeded ${inserted} attendance records for October 2026!`);
  } catch(err) {
    console.error('Seeding error:', err);
  } finally {
    await pool.end();
  }
}
seed();

