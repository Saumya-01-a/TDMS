const pool = require("../config/db");

async function seedLessons() {
  try {
    // 1. Get valid IDs
    const studentsRes = await pool.query("SELECT student_id FROM students LIMIT 10");
    const instructorsRes = await pool.query("SELECT instructor_id FROM instructors LIMIT 5"); // Relaxed for seeding
    const vehiclesRes = await pool.query("SELECT vehicle_id FROM vehicles LIMIT 10");

    if (studentsRes.rowCount === 0 || instructorsRes.rowCount === 0 || vehiclesRes.rowCount === 0) {
      console.log("Missing prerequisite data (students, instructors, or vehicles) to seed lessons.");
      process.exit(1);
    }

    const students = studentsRes.rows;
    const instructors = instructorsRes.rows;
    const vehicles = vehiclesRes.rows;

    const lessons = [
      {
        student_id: students[0].student_id,
        instructor_id: instructors[0].instructor_id,
        vehicle_id: vehicles[0].vehicle_id,
        lesson_date: '2026-04-20',
        session_number: 1
      },
      {
        student_id: students[1] ? students[1].student_id : students[0].student_id,
        instructor_id: instructors[1] ? instructors[1].instructor_id : instructors[0].instructor_id,
        vehicle_id: vehicles[1] ? vehicles[1].vehicle_id : vehicles[0].vehicle_id,
        lesson_date: '2026-04-20',
        session_number: 2
      },
      {
        student_id: students[2] ? students[2].student_id : students[0].student_id,
        instructor_id: instructors[0].instructor_id,
        vehicle_id: vehicles[0].vehicle_id,
        lesson_date: '2026-04-21',
        session_number: 3
      },
      {
        student_id: students[0].student_id,
        instructor_id: instructors[1] ? instructors[ instructors.length-1 ].instructor_id : instructors[0].instructor_id,
        vehicle_id: vehicles[ vehicles.length-1 ].vehicle_id,
        lesson_date: '2026-04-22',
        session_number: 4
      }
    ];

    console.log("🧹 Cleaning old mock lessons...");
    await pool.query("DELETE FROM lessons WHERE status = 'Scheduled'");

    console.log("🌱 Seeding lesson examples...");
    for (const lesson of lessons) {
      await pool.query(
        `INSERT INTO lessons (student_id, instructor_id, vehicle_id, lesson_date, session_number, status)
         VALUES ($1, $2, $3, $4, $5, 'Scheduled')`,
        [lesson.student_id, lesson.instructor_id, lesson.vehicle_id, lesson.lesson_date, lesson.session_number]
      );
    }

    console.log("✅ Successfully seeded lesson schedules");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedLessons();
