const pool = require("../config/db");

async function seedAttendance() {
  try {
    const studentsRes = await pool.query("SELECT student_id FROM students LIMIT 10");
    const instructorsRes = await pool.query("SELECT instructor_id FROM instructors LIMIT 5");

    if (studentsRes.rowCount === 0) {
      console.log("No students found to seed attendance.");
      process.exit(0);
    }

    const students = studentsRes.rows;
    const instructorId = instructorsRes.rows[0]?.instructor_id || 'System Admin';

    // Current month days
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    console.log(`🌱 Seeding attendance for ${month}/${year}...`);

    for (let i = 0; i < 15; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const day = Math.floor(Math.random() * 20) + 1; // 1 to 20
        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const status = Math.random() > 0.3 ? 'Present' : (Math.random() > 0.5 ? 'Late' : 'Absent');
        const session = Math.floor(Math.random() * 4) + 1;
        const time_slots = { 1: '08:00 AM - 10:00 AM', 2: '10:00 AM - 12:00 PM', 3: '01:00 PM - 03:00 PM', 4: '03:00 PM - 05:00 PM' };

        await pool.query(
            `INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [student.student_id, instructorId, date, status, session, time_slots[session]]
        );
    }

    console.log("✅ Attendance seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedAttendance();
