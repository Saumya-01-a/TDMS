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

    // 4. Get Payment History (Real Data)
    const paymentsRes = await pool.query(
      `SELECT payment_id, amount, payment_date, status, payment_method
       FROM payments 
       WHERE student_id = $1 
       ORDER BY payment_date DESC LIMIT 5`,
      [studentId]
    );

    res.json({
      ok: true,
      student: studentRes.rows[0],
      lessons: lessonsRes.rows,
      trial: trialRes.rows[0] || null,
      payments: paymentsRes.rows
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
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I') && instructorId !== 'INST-DEFAULT') {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const result = await pool.query(`
      SELECT tea.*, te.trial_date, u.first_name, u.last_name
      FROM trial_exam_assignments tea
      JOIN trial_exams te ON tea.trial_id = te.id
      JOIN students s ON tea.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE s.instructor_id = $1 AND te.trial_date >= CURRENT_DATE
      ORDER BY te.trial_date ASC
    `, [finalId]);
    res.json({ ok: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
/**
 * Get full lesson schedule for a student
 */
exports.getStudentFullSchedule = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT l.*, u_i.first_name as instructor_fname, u_i.last_name as instructor_lname, 
              v.registration_number as vehicle_reg, v.type as vehicle_type
       FROM lessons l
       JOIN students s ON l.student_id = s.student_id
       JOIN instructors i ON l.instructor_id = i.instructor_id
       JOIN users u_i ON i.user_id = u_i.user_id
       JOIN vehicles v ON l.vehicle_id = v.vehicle_id
       WHERE s.user_id = $1
       ORDER BY l.lesson_date DESC`,
      [userId]
    );
    res.json({ ok: true, lessons: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get all available packages
 */
exports.getPackages = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM packages ORDER BY price ASC");
    res.json({ ok: true, packages: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Update student's selected package
 */
exports.selectPackage = async (req, res) => {
  const { userId, packageId } = req.body;
  try {
    const result = await pool.query(
      "UPDATE students SET package_id = $1 WHERE user_id = $2 RETURNING *",
      [packageId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Student not found" });
    }
    res.json({ ok: true, message: "Package selected successfully", student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get full payment history for a student
 */
exports.getStudentPayments = async (req, res) => {
  const { userId } = req.params;
  try {
    const student = await pool.query("SELECT student_id FROM students WHERE user_id = $1", [userId]);
    if (student.rowCount === 0) return res.status(404).json({ ok: false, message: "Student not found" });

    const result = await pool.query(
      `SELECT * FROM payments WHERE student_id = $1 ORDER BY payment_date DESC`,
      [student.rows[0].student_id]
    );
    res.json({ ok: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get full profile details for a student
 */
exports.getStudentProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, u.email, u.tel_no, u.address_line_1, u.address_line_2, u.city,
              s.student_id, s.nic, s.registered_date, s.progress, s.status, p.name as package_name,
              i.first_name as ins_fname, i.last_name as ins_lname, inst.instructor_id
       FROM users u
       JOIN students s ON u.user_id = s.user_id
       LEFT JOIN packages p ON s.package_id = p.id
       LEFT JOIN instructors inst ON s.instructor_id = inst.instructor_id
       LEFT JOIN users i ON inst.user_id = i.user_id
       WHERE u.user_id = $1`,
      [userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ ok: false, message: "Profile not found" });
    res.json({ ok: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Update Student profile contact info
 */
exports.updateStudentProfile = async (req, res) => {
  const { userId } = req.params;
  const { email, phone, addressLine1, addressLine2, city } = req.body;
  try {
    await pool.query(
      `UPDATE users 
       SET email = COALESCE($1, email), 
           tel_no = COALESCE($2, tel_no),
           address_line_1 = COALESCE($3, address_line_1),
           address_line_2 = COALESCE($4, address_line_2),
           city = COALESCE($5, city)
       WHERE user_id = $6`,
      [email, phone, addressLine1, addressLine2, city, userId]
    );
    res.json({ ok: true, message: "Profile synchronized successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
