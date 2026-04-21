const pool = require("./config/db");

async function checkData() {
  try {
    const studentsCount = await pool.query("SELECT COUNT(*) FROM students");
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const attendanceCount = await pool.query("SELECT COUNT(*) FROM attendance");
    const studentSample = await pool.query("SELECT s.student_id, u.first_name FROM students s JOIN users u ON s.user_id = u.user_id LIMIT 5");

    console.log("Students:", studentsCount.rows[0].count);
    console.log("Users:", usersCount.rows[0].count);
    console.log("Attendance:", attendanceCount.rows[0].count);
    console.log("Sample JOIN:", studentSample.rows);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
