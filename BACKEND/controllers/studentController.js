const pool = require("../config/db");

/**
 * Fetch Student Dashboard Data
 * Progress, status, and upcoming lessons
 */
exports.getStudentDashboardData = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Get Student Progress & Basic Info
    const studentRes = await pool.query(
      `SELECT s.student_id, s.progress, s.status, p.name as package_name,
              u.first_name, u.last_name, s.instructor_id
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN packages p ON s.package_id = p.id
       WHERE s.user_id = $1`,
      [userId]
    );

    if (studentRes.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Student record not found" });
    }

    const studentId = studentRes.rows[0].student_id;

    // 2. Get Upcoming Lessons
    const lessonsRes = await pool.query(
      `SELECT l.*, u_i.first_name as instructor_fname, u_i.last_name as instructor_lname
       FROM lessons l
       JOIN instructors i ON l.instructor_id = i.instructor_id
       JOIN users u_i ON i.user_id = u_i.user_id
       WHERE l.student_id = $1 AND l.lesson_date >= CURRENT_DATE
       ORDER BY l.lesson_date ASC, l.session_number ASC
       LIMIT 5`,
      [studentId]
    );

    // 3. Get Active Trial Assignment
    const trialRes = await pool.query(
      `SELECT tea.*, te.trial_date
       FROM trial_exam_assignments tea
       JOIN trial_exams te ON tea.trial_id = te.id
       WHERE tea.student_id = $1 AND te.trial_date >= CURRENT_DATE`,
      [studentId]
    );

    res.json({
      ok: true,
      student: studentRes.rows[0],
      lessons: lessonsRes.rows,
      trial: trialRes.rows[0] || null
    });
  } catch (err) {
    console.error("Student Dashboard Data Error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get all students (for Admin trial assignment)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.student_id, u.first_name, u.last_name, s.instructor_id
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      ORDER BY u.first_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get trial candidates for a specific instructor
 */
exports.getInstructorTrialCandidates = async (req, res) => {
  const { instructorId } = req.params;
  try {
    const result = await pool.query(`
      SELECT tea.*, te.trial_date, u.first_name, u.last_name
      FROM trial_exam_assignments tea
      JOIN trial_exams te ON tea.trial_id = te.id
      JOIN students s ON tea.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE s.instructor_id = $1 AND te.trial_date >= CURRENT_DATE
      ORDER BY te.trial_date ASC
    `, [instructorId]);
    res.json({ ok: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
