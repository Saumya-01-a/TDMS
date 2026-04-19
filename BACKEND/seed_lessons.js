const pool = require('./config/db');

async function seed() {
  try {
    console.log('--- Lesson Schedule Seeding ---');

    // 1. Get IDs for students, instructors, vehicles
    const students = await pool.query("SELECT student_id FROM students LIMIT 3");
    const instructors = await pool.query("SELECT instructor_id FROM instructors WHERE approval_status = 'approved' LIMIT 2");
    const vehicles = await pool.query("SELECT vehicle_id FROM vehicles LIMIT 3");

    if (students.rowCount === 0 || instructors.rowCount === 0 || vehicles.rowCount === 0) {
      console.error("Missing necessary data (students/instructors/vehicles) to seed lessons.");
      process.exit(1);
    }

    const sIds = students.rows.map(r => r.student_id);
    const iIds = ['INST-DEFAULT'];
    const vIds = vehicles.rows.map(r => r.vehicle_id);

    // 2. Clear ALL old lessons for clean demo
    await pool.query("DELETE FROM public.lessons");

    // 3. Insert some records formatted for the table
    const demoLessons = [
      [sIds[0], iIds[0], vIds[0], '2024-04-25', 1, 'Scheduled'],
      [sIds[1], iIds[0], vIds[1], '2024-04-26', 2, 'Completed'],
      [sIds[2], iIds[0], vIds[2], '2024-04-27', 3, 'Scheduled'],
      [sIds[0], iIds[0], vIds[0], '2024-04-28', 4, 'Rescheduled']
    ];

    for (const [sid, iid, vid, date, sess, status] of demoLessons) {
      await pool.query(
        "INSERT INTO lessons (student_id, instructor_id, vehicle_id, lesson_date, session_number, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [sid, iid, vid, date, sess, status]
      );
    }

    console.log('✅ Seeded 4 demo lessons into the schedule');
  } catch (err) {
    console.error('❌ SEEDING FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
