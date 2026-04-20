const pool = require("../config/db");
const bcrypt = require('bcrypt');
const emailService = require("../services/emailService");
const { 
  sendNotificationToUser, 
  broadcastFinancialUpdate, 
  broadcastStudentUpdate,
  broadcastPackageUpdate
} = require("../socket");

exports.getPendingInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.email, u.tel_no, u.first_name, u.last_name
       FROM instructors i
       JOIN users u ON i.user_id = u.user_id
       WHERE i.approval_status = 'pending'`
    );
    res.json({ ok: true, instructors: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.approveInstructor = async (req, res) => {
  const { instructorId, status } = req.body; // status: 'approved' or 'rejected'

  if (!instructorId || !status) {
    return res.status(400).json({ ok: false, message: "Missing instructorId or status" });
  }

  try {
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE instructors SET approval_status = $1 WHERE instructor_id = $2`,
        [status, instructorId]
      );

      if (status === 'approved') {
        const result = await client.query(
          `SELECT u.user_id, u.email FROM users u 
           JOIN instructors i ON u.user_id = i.user_id 
           WHERE i.instructor_id = $1`,
          [instructorId]
        );
        
        if (result.rows.length > 0) {
          const { user_id, email, first_name } = result.rows[0];
          // Update user status to approved (waiting for email verification)
          await client.query(
            "UPDATE users SET status = 'approved' WHERE user_id = $1",
            [user_id]
          );
          // Send email with error handling
          try {
            await emailService.sendVerificationEmail(email, user_id, first_name);
          } catch (emailErr) {
            console.error("📧 Email failed but continuing approval:", emailErr.message);
          }
        }
      } else if (status === 'rejected') {
        const result = await client.query(
          `SELECT user_id FROM instructors WHERE instructor_id = $1`,
          [instructorId]
        );
        if (result.rows.length > 0) {
          await client.query(
            "UPDATE users SET status = 'rejected' WHERE user_id = $1",
            [result.rows[0].user_id]
          );
        }
      }

      await client.query("COMMIT");
      
      // Log Activity
      await pool.query(
        "INSERT INTO activity_logs (message, type) VALUES ($1, $2)",
        [`Admin ${status} instructor application for instructor ID: ${instructorId}`, 'approval']
      );

      res.json({ ok: true, message: `Instructor ${status === 'approved' ? 'approved' : 'rejected'} successfully` });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Approval flow error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get Dashboard Stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Core Counts
    const studentsRes = await pool.query("SELECT count(*) FROM students");
    const instructorsRes = await pool.query("SELECT count(*) FROM instructors WHERE approval_status = 'approved'");
    const pendingRes = await pool.query("SELECT count(*) FROM instructors WHERE approval_status = 'pending'");
    const vehiclesRes = await pool.query("SELECT count(*) FROM vehicles");

    // 2. Financial Dues (New)
    // Student Dues: SUM(package_price - payments)
    const studentDuesRes = await pool.query(`
      SELECT SUM(p.price - COALESCE(pmt.total_paid, 0)) as dues
      FROM students s
      JOIN packages p ON s.package_id = p.id
      LEFT JOIN (
        SELECT student_id, SUM(amount) as total_paid 
        FROM payments 
        GROUP BY student_id
      ) pmt ON s.student_id = pmt.student_id
    `);

    // Instructor Payables: SUM(lessons*rate - payouts)
    const instructorPayablesRes = await pool.query(`
      SELECT SUM(COALESCE(lsn.count, 0) * i.pay_rate - COALESCE(pay.total_paid, 0)) as payables
      FROM instructors i
      LEFT JOIN (
        SELECT instructor_id, COUNT(*) as count 
        FROM lessons 
        WHERE status = 'Completed' 
        GROUP BY instructor_id
      ) lsn ON i.instructor_id = lsn.instructor_id
      LEFT JOIN (
        SELECT instructor_id, SUM(amount) as total_paid 
        FROM instructor_payouts 
        GROUP BY instructor_id
      ) pay ON i.instructor_id = pay.instructor_id
      WHERE i.approval_status = 'approved'
    `);

    res.json({
      ok: true,
      stats: {
        totalStudents: studentsRes.rows[0].count,
        activeInstructors: instructorsRes.rows[0].count,
        pendingApprovals: pendingRes.rows[0].count,
        activeVehicles: vehiclesRes.rows[0].count,
        totalStudentDues: studentDuesRes.rows[0].dues || 0,
        totalInstructorPayable: instructorPayablesRes.rows[0].payables || 0
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get Recent Activity
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10"
    );
    res.json({ ok: true, activities: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// --- Student Management Features ---

// Update student progress
exports.updateStudentProgress = async (req, res) => {
  const { id } = req.params; // student_id
  const { progress } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ ok: false, message: "Valid progress (0-100) required" });
  }

  try {
    const status = progress === 100 ? 'Completed' : 'Learning';
    await pool.query(
      "UPDATE students SET progress = $1, status = $2 WHERE student_id = $3",
      [progress, status, id]
    );
    res.json({ ok: true, message: "Progress updated successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Complete license flow
exports.completeLicense = async (req, res) => {
  const { id } = req.params; // student_id

  try {
    const result = await pool.query(
      `UPDATE students 
       SET status = 'Completed', progress = 100, completion_date = CURRENT_TIMESTAMP 
       WHERE student_id = $1 
       RETURNING instructor_id, user_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Student not found" });
    }

    const { instructor_id, user_id } = result.rows[0];

    // Create a 'Congratulations' notification
    const msg = "Congratulations! You have successfully completed your driving license course.";
    const notifyRes = await pool.query(
      "INSERT INTO notifications (instructor_id, message, type) VALUES ($1, $2, 'success') RETURNING *",
      [instructor_id, msg]
    );

    // 🔥 Emit real-time socket event
    sendNotificationToUser(instructor_id, notifyRes.rows[0]);

    res.json({ ok: true, message: "License completion processed. Student notified." });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Export students as CSV
exports.exportStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, s.student_id, p.name as package_name, 
              s.registered_date, s.completion_date, i.instructor_name
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN packages p ON s.package_id = p.id
        LEFT JOIN instructors i ON s.instructor_id = i.instructor_id`
    );

    // Simple CSV conversion
    let csv = "First Name,Last Name,Student ID,Package,Registered Date,Completion Date,Instructor\n";
    result.rows.forEach(row => {
      // Fix date formats
      const regDate = row.registered_date ? new Date(row.registered_date).toLocaleDateString() : 'N/A';
      const cmpDate = row.completion_date ? new Date(row.completion_date).toLocaleDateString() : 'N/A';
      
      csv += `${row.first_name},${row.last_name},${row.student_id},${row.package_name || 'N/A'},${regDate},${cmpDate},${row.instructor_name || 'N/A'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students_export.csv');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Bulk Cleanup
exports.bulkCleanup = async (req, res) => {
  const { ids } = req.body; // Array of student_ids

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ ok: false, message: "No student IDs provided" });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      // 1. Get associated user_ids
      const userResult = await client.query(
        "SELECT user_id FROM students WHERE student_id = ANY($1)",
        [ids]
      );
      const userIds = userResult.rows.map(r => r.user_id);

      if (userIds.length > 0) {
        // 2. Delete from reviews first (FK)
        await client.query("DELETE FROM reviews WHERE student_id = ANY($1)", [ids]);
        
        // 3. Delete from sessions (FK)
        await client.query("DELETE FROM sessions WHERE student_id = ANY($1)", [ids]);

        // 4. Delete from students
        await client.query("DELETE FROM students WHERE student_id = ANY($1)", [ids]);

        // 5. Delete from users
        await client.query("DELETE FROM users WHERE user_id = ANY($1)", [userIds]);
      }

      await client.query("COMMIT");
      broadcastStudentUpdate(); // Sync global counts & lists
      res.json({ ok: true, message: "Selected students and their account data permanently removed" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
// --- Student Management Features ---

// Fetch all students for the admin dashboard
exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email, u.tel_no, u.address_line_1 as address,
              i.instructor_name, p.name as package_name
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN instructors i ON s.instructor_id = i.instructor_id
       LEFT JOIN packages p ON s.package_id = p.id
       ORDER BY s.registered_date DESC`
    );
    res.json({ ok: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Manually register a new student (Admin Only)
exports.addStudent = async (req, res) => {
  const { firstName, lastName, email, phone, nic, address, packageId, password } = req.body;
  if (!firstName || !email || !nic) {
    return res.status(400).json({ ok: false, message: "Missing required student data" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password || '123456', 10);
    const userId = `U${Date.now()}`;
    const studentId = `S${Date.now()}`;

    // 1. Create User
    await client.query(
      `INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, tel_no, address_line_1, status, email_verified, created_date)
       VALUES ($1, $2, $3, $4, $5, 'Student', $6, $7, 'active', true, CURRENT_DATE)`,
      [userId, firstName, lastName, email, passwordHash, phone, address]
    );

    // 2. Create Student profile
    await client.query(
      "INSERT INTO students (student_id, user_id, package_id, status, nic, address, registered_date) VALUES ($1, $2, $3, 'Learning', $4, $5, CURRENT_DATE)",
      [studentId, userId, (packageId && packageId !== '') ? packageId : null, nic, address]
    );

    await client.query("COMMIT");
    broadcastStudentUpdate(); // Sync global counts & lists
    res.status(201).json({ ok: true, message: "Student registered successfully (Role: Student)" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    client.release();
  }
};

// Edit student details
exports.editStudent = async (req, res) => {
  const { id } = req.params; // student_id
  const { firstName, lastName, email, phone, address, status, progress } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      // Get user_id first
      const stdRes = await client.query("SELECT user_id FROM students WHERE student_id = $1", [id]);
      if (stdRes.rowCount === 0) return res.status(404).json({ ok: false, message: "Student not found" });
      const userId = stdRes.rows[0].user_id;

      // Update User
      await client.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, tel_no = $4, address_line_1 = $5 
         WHERE user_id = $6`,
        [firstName, lastName, email, phone, address, userId]
      );

      // Update Student
      await client.query(
        "UPDATE students SET status = $1, progress = $2, package_id = $3, address = $4 WHERE student_id = $5",
        [status, progress, (packageId && packageId !== '') ? packageId : null, address, id]
      );

      await client.query("COMMIT");
      broadcastStudentUpdate(); // Sync global counts & lists
      res.json({ ok: true, message: "Student details updated successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Single Student Delete
exports.deleteStudent = async (req, res) => {
  const { id } = req.params; // student_id
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const stdRes = await client.query("SELECT user_id FROM students WHERE student_id = $1", [id]);
      if (stdRes.rowCount === 0) return res.status(404).json({ ok: false, message: "Student not found" });
      const userId = stdRes.rows[0].user_id;

      // Cascading deletion
      await client.query("DELETE FROM reviews WHERE student_id = $1", [id]);
      await client.query("DELETE FROM sessions WHERE student_id = $1", [id]);
      await client.query("DELETE FROM attendance WHERE student_id = $1", [id]);
      await client.query("DELETE FROM payments WHERE student_id = $1", [id]);
      await client.query("DELETE FROM students WHERE student_id = $1", [id]);
      await client.query("DELETE FROM users WHERE user_id = $1", [userId]);

      await client.query("COMMIT");
      broadcastStudentUpdate(); // Sync global counts & lists
      res.json({ ok: true, message: "Student and all associated data permanently removed" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Assign an instructor to a student
exports.assignInstructor = async (req, res) => {
  const { studentId, instructorId } = req.body;
  
  if (!studentId || !instructorId) {
    return res.status(400).json({ ok: false, message: "Missing studentId or instructorId" });
  }

  try {
    await pool.query(
      "UPDATE students SET instructor_id = $1 WHERE student_id = $2",
      [instructorId, studentId]
    );
    res.json({ ok: true, message: "Instructor assigned successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};


// Fetch all lesson schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, 
              u_s.first_name as student_fname, u_s.last_name as student_lname,
              u_i.first_name as instructor_fname, u_i.last_name as instructor_lname,
              v.registration_number as vehicle_reg
       FROM lessons l
       JOIN students s ON l.student_id = s.student_id
       JOIN users u_s ON s.user_id = u_s.user_id
       JOIN instructors i ON l.instructor_id = i.instructor_id
       JOIN users u_i ON i.user_id = u_i.user_id
       JOIN vehicles v ON l.vehicle_id = v.vehicle_id
       ORDER BY l.lesson_date DESC, l.session_number ASC`
    );
    res.json({ ok: true, schedules: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Fetch data for the schedule creation modal (Students, Instructors, Vehicles)
exports.getScheduleFormData = async (req, res) => {
  try {
    const studentsRes = await pool.query(
      `SELECT s.student_id, u.first_name, u.last_name FROM students s 
       JOIN users u ON s.user_id = u.user_id ORDER BY u.first_name ASC`
    );
    const instructorsRes = await pool.query(
      `SELECT i.instructor_id, u.first_name, u.last_name, i.availability_status 
       FROM instructors i 
       JOIN users u ON i.user_id = u.user_id 
       WHERE i.approval_status = 'approved' 
       ORDER BY u.first_name ASC`
    );
    const vehiclesRes = await pool.query(
      `SELECT vehicle_id, registration_number as reg_no, type FROM vehicles WHERE status ILIKE 'available' ORDER BY type ASC`
    );

    res.json({
      ok: true,
      students: studentsRes.rows,
      instructors: instructorsRes.rows,
      vehicles: vehiclesRes.rows
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Create a new lesson assignment
exports.createLesson = async (req, res) => {
  const { student_id, instructor_id, vehicle_id, lesson_date, session_number } = req.body;

  try {
    // 1. Basic Validation
    if (!student_id || !instructor_id || !vehicle_id || !lesson_date || !session_number) {
      return res.status(400).json({ ok: false, message: "All fields are required" });
    }

    // 2. Conflict Validation (Explicit check for better UX message)
    const conflictRes = await pool.query(
      `SELECT * FROM lessons 
       WHERE lesson_date = $1 AND session_number = $2 
       AND (instructor_id = $3 OR vehicle_id = $4)`,
      [lesson_date, session_number, instructor_id, vehicle_id]
    );

    if (conflictRes.rowCount > 0) {
      const conflict = conflictRes.rows[0];
      const target = conflict.instructor_id === instructor_id ? 'Instructor' : 'Vehicle';
      return res.status(409).json({ ok: false, message: `${target} is already booked for this time slot.` });
    }

    // 3. Insert
    const result = await pool.query(
      `INSERT INTO lessons (student_id, instructor_id, vehicle_id, lesson_date, session_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [student_id, instructor_id, vehicle_id, lesson_date, session_number]
    );

    res.status(201).json({ ok: true, lesson: result.rows[0], message: "Lesson scheduled successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Update lesson status or assignment
exports.updateLesson = async (req, res) => {
  const { id } = req.params;
  const { status, lesson_date, session_number, instructor_id, vehicle_id } = req.body;

  try {
    await pool.query(
      `UPDATE lessons 
       SET status = COALESCE($1, status),
           lesson_date = COALESCE($2, lesson_date),
           session_number = COALESCE($3, session_number),
           instructor_id = COALESCE($4, instructor_id),
           vehicle_id = COALESCE($5, vehicle_id)
       WHERE id = $6`,
      [status, lesson_date, session_number, instructor_id, vehicle_id, id]
    );
    res.json({ ok: true, message: "Lesson updated successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Delete a scheduled lesson
exports.deleteLesson = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
    res.json({ ok: true, message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Fetch All Instructors (Approved) with full details for Admin management
 */
exports.getAllInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.email, u.tel_no, u.first_name, u.last_name, u.address_line_1
       FROM instructors i
       JOIN users u ON i.user_id = u.user_id
       ORDER BY u.first_name ASC`
    );
    res.json({ ok: true, instructors: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Manually register a new instructor (Admin Only)
exports.addInstructor = async (req, res) => {
  const bcrypt = require('bcrypt');
  const { firstName, lastName, email, phone, nic, address, licenseNo, special, regNo, password } = req.body;
  if (!firstName || !email || !nic || !regNo) {
    return res.status(400).json({ ok: false, message: "Missing required instructor data" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const userId = `U${Date.now()}`;
    const instructorId = `I${Date.now()}`;

    // 1. Create User
    await client.query(
      `INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, tel_no, address_line_1, status, email_verified, created_date)
       VALUES ($1, $2, $3, $4, $5, 'Instructor', $6, $7, 'active', true, CURRENT_DATE)`,
      [userId, firstName, lastName, email, hashedPassword, phone, address]
    );

    // 2. Create Instructor profile
    await client.query(
      `INSERT INTO instructors (instructor_id, user_id, instructor_reg_no, licence_no, specialization, approval_status, instructor_name, nic) 
       VALUES ($1, $2, $3, $4, $5, 'approved', $6, $7)`,
      [instructorId, userId, regNo, licenseNo, special, `${firstName} ${lastName}`, nic]
    );

    await client.query("COMMIT");
    res.status(201).json({ ok: true, message: "Instructor registered successfully (Role: Instructor)" });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    client.release();
  }
};

// Edit instructor details
exports.editInstructor = async (req, res) => {
  const { id } = req.params; // instructor_id
  const { firstName, lastName, email, phone, address, special, regNo, licenseNo, status } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const insRes = await client.query("SELECT user_id FROM instructors WHERE instructor_id = $1", [id]);
      if (insRes.rowCount === 0) return res.status(404).json({ ok: false, message: "Instructor not found" });
      const userId = insRes.rows[0].user_id;

      // Update User
      await client.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, tel_no = $4, address_line_1 = $5 
         WHERE user_id = $6`,
        [firstName, lastName, email, phone, address, userId]
      );

      // Update Instructor
      await client.query(
        `UPDATE instructors SET specialization = $1, instructor_reg_no = $2, licence_no = $3, approval_status = $4, instructor_name = $5, nic = $6
         WHERE instructor_id = $7`,
        [special, regNo, licenseNo, status, `${firstName} ${lastName}`, nic, id]
      );

      await client.query("COMMIT");
      res.json({ ok: true, message: "Instructor details updated successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Single Instructor Delete
exports.deleteInstructor = async (req, res) => {
  const { id } = req.params; // instructor_id
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const insRes = await client.query("SELECT user_id FROM instructors WHERE instructor_id = $1", [id]);
      if (insRes.rowCount === 0) return res.status(404).json({ ok: false, message: "Instructor not found" });
      const userId = insRes.rows[0].user_id;

      // Cascading deletion (Sessions, lessons, payouts, materials, etc.)
      await client.query("DELETE FROM sessions WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM lessons WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM attendance WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM instructor_payouts WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM instructor_vehicles WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM materials WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM notifications WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM instructors WHERE instructor_id = $1", [id]);
      await client.query("DELETE FROM users WHERE user_id = $1", [userId]);

      await client.query("COMMIT");
      res.json({ ok: true, message: "Instructor and all associated system data permanently removed" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * 1. Monthly Financial Overview (Jan-Dec)
 */
exports.getFinancialOverview = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const result = await pool.query(`
      WITH months AS (
        SELECT generate_series(1, 12) as month
      ),
      month_collections AS (
        SELECT 
          EXTRACT(MONTH FROM payment_date) as month,
          SUM(amount) as total
        FROM payments 
        WHERE EXTRACT(YEAR FROM payment_date) = $1
        GROUP BY month
      ),
      month_payouts AS (
        SELECT 
          EXTRACT(MONTH FROM payout_date) as month,
          SUM(amount) as total
        FROM instructor_payouts 
        WHERE EXTRACT(YEAR FROM payout_date) = $1
        GROUP BY month
      )
      SELECT 
        m.month,
        COALESCE(c.total, 0) as collections,
        COALESCE(p.total, 0) as payouts,
        (COALESCE(c.total, 0) - COALESCE(p.total, 0)) as net
      FROM months m
      LEFT JOIN month_collections c ON m.month = c.month
      LEFT JOIN month_payouts p ON m.month = p.month
      ORDER BY m.month
    `, [year]);

    res.json({ ok: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * 2. Instructor Payout Details
 */
exports.getInstructorPayoutDetails = async (req, res) => {
  const { id } = req.params; // instructor_id
  try {
    const lsnRes = await pool.query(
      "SELECT COUNT(*) FROM lessons WHERE instructor_id = $1 AND status = 'Completed'",
      [id]
    );
    const payRes = await pool.query(
      "SELECT SUM(amount) FROM instructor_payouts WHERE instructor_id = $1",
      [id]
    );
    const histRes = await pool.query(
      "SELECT * FROM instructor_payouts WHERE instructor_id = $1 ORDER BY payout_date DESC LIMIT 5",
      [id]
    );
    const rateRes = await pool.query(
      "SELECT pay_rate FROM instructors WHERE instructor_id = $1",
      [id]
    );

    const totalLessons = parseInt(lsnRes.rows[0].count || 0);
    const totalPaid = parseFloat(payRes.rows[0].sum || 0);
    const payRate = parseFloat(rateRes.rows[0].pay_rate || 500);
    const totalDue = (totalLessons * payRate) - totalPaid;

    res.json({
      ok: true,
      details: {
        totalLessons,
        payRate,
        totalAmountDue: Math.max(0, totalDue),
        payoutHistory: histRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * 3. Mark Instructor as Paid
 */
exports.recordInstructorPayout = async (req, res) => {
  const { instructor_id, amount, reference } = req.body;

  if (!instructor_id || !amount) {
    return res.status(400).json({ ok: false, message: "Missing instructor_id or amount" });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const result = await client.query(
        `INSERT INTO instructor_payouts (instructor_id, amount, reference)
         VALUES ($1, $2, $3) RETURNING *`,
        [instructor_id, amount, reference]
      );

      // Log Activity
      await client.query(
        "INSERT INTO activity_logs (message, type) VALUES ($1, 'payout')",
        [`Payout of Rs. ${amount} recorded for instructor ID: ${instructor_id}`, 'payout']
      );

      await client.query("COMMIT");
      
      // Trigger real-time dashboard update
      broadcastFinancialUpdate();

      res.json({ ok: true, payout: result.rows[0], message: "Payout recorded successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * --- Fleet Management (Vehicles) ---
 */

// Fetch all vehicles with instructor mapping through join table
exports.getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.first_name || ' ' || u.last_name as instructor_name,
              iv.instructor_id as assigned_instructor_id,
              (SELECT created_at FROM gps_logs WHERE vehicle_id = v.vehicle_id ORDER BY created_at DESC LIMIT 1) as last_seen
       FROM vehicles v
       LEFT JOIN instructor_vehicles iv ON v.vehicle_id = iv.vehicle_id
       LEFT JOIN instructors i ON iv.instructor_id = i.instructor_id
       LEFT JOIN users u ON i.user_id = u.user_id
       ORDER BY v.vehicle_id ASC`
    );
    res.json({ ok: true, vehicles: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Manually add new vehicle
exports.addVehicle = async (req, res) => {
  const { model, registration_number, type, transmission, status, year } = req.body;
  if (!model || !registration_number) {
    return res.status(400).json({ ok: false, message: "Missing required vehicle data" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vehicles (model, registration_number, type, transmission, status, year) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [model, registration_number, type || 'Car', transmission || 'Manual', status || 'Available', year || new Date().getFullYear()]
    );
    res.status(201).json({ ok: true, vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Edit vehicle details
exports.editVehicle = async (req, res) => {
  const { id } = req.params;
  const { model, registration_number, type, transmission, status, year } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vehicles SET model = $1, registration_number = $2, type = $3, transmission = $4, status = $5, year = $6
       WHERE vehicle_id = $7 RETURNING *`,
      [model, registration_number, type, transmission, status, year, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ ok: false, message: "Vehicle not found" });
    res.json({ ok: true, vehicle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Remove Vehicle (Cascading)
exports.deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM lessons WHERE vehicle_id = $1", [id]);
      await client.query("DELETE FROM gps_logs WHERE vehicle_id = $1", [id]);
      await client.query("DELETE FROM gps_routes WHERE vehicle_id = $1", [id]);
      await client.query("DELETE FROM instructor_vehicles WHERE vehicle_id = $1", [id]);
      await client.query("DELETE FROM vehicles WHERE vehicle_id = $1", [id]);
      await client.query("COMMIT");
      res.json({ ok: true, message: "Vehicle and all historical logs permanently removed" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Get Latest Vehicle Location
exports.getLatestVehicleLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT lat, lng, speed, created_at FROM gps_logs WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 1",
      [id]
    );
    if (result.rowCount === 0) {
      // 404 is handled by frontend to show "Not Deployed" state
      return res.status(404).json({ ok: false, message: "Vehicle not currently broadcasting location data" });
    }
    res.json({ ok: true, location: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Assign/Reassign an instructor to a vehicle
exports.assignVehicleInstructor = async (req, res) => {
  const { vehicleId, instructorId } = req.body;

  if (!vehicleId) {
    return res.status(400).json({ ok: false, message: "Missing vehicleId" });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Remove any current assignment for this vehicle (Primary assignment logic)
      await client.query("DELETE FROM instructor_vehicles WHERE vehicle_id = $1", [vehicleId]);

      // 2. Insert new assignment if instructorId is provided (allows unassigning if null)
      if (instructorId) {
        await client.query(
          "INSERT INTO instructor_vehicles (vehicle_id, instructor_id) VALUES ($1, $2)",
          [vehicleId, instructorId]
        );
      }

      // 3. Log Activity
      await client.query(
        "INSERT INTO activity_logs (message, type) VALUES ($1, 'system')",
        [`Fleet assignment updated for vehicle ID: ${vehicleId}. Instructor: ${instructorId || 'None'}`, 'system']
      );

      await client.query("COMMIT");
      res.json({ ok: true, message: "Vehicle instructor assignment updated successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * --- Attendance Management (Admin View) ---
 */

// Fetch all attendance logs with joined names
exports.getAllAttendanceLogs = async (req, res) => {
  try {
// Fetch All Attendance Logs (Flattened for Audit Table)
exports.getAllAttendanceLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              us.first_name, us.last_name,
              ui.first_name as instructor_fname, ui.last_name as instructor_lname
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users us ON s.user_id = us.user_id
       LEFT JOIN instructors i ON a.instructor_id = i.instructor_id
       LEFT JOIN users ui ON i.user_id = ui.user_id
       ORDER BY a.attendance_date DESC, a.created_at DESC
       LIMIT 100`
    );
    res.json({ ok: true, logs: result.rows, history: result.rows }); // history alias for frontend compatibility
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Get Attendance Live Stats (Monthly Summary)
exports.getAttendanceStats = async (req, res) => {
  const { month, year } = req.query;
  try {
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    const statsRes = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'Present') as present,
        COUNT(*) FILTER (WHERE status = 'Late') as late,
        COUNT(*) FILTER (WHERE status = 'Absent') as absent
       FROM attendance
       WHERE EXTRACT(MONTH FROM attendance_date) = $1 
         AND EXTRACT(YEAR FROM attendance_date) = $2`,
      [m, y]
    );
    
    const s = statsRes.rows[0];
    res.json({
      ok: true,
      stats: {
        present: parseInt(s.present) || 0,
        late: parseInt(s.late) || 0,
        absent: parseInt(s.absent) || 0
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Get Monthly Attendance Grid data (Global View)
exports.getMonthlyAttendanceGrid = async (req, res) => {
  const { month, year } = req.query;
  try {
    // 1. Fetch Students
    const studentsRes = await pool.query(
      `SELECT s.student_id, u.first_name, u.last_name 
       FROM students s JOIN users u ON s.user_id = u.user_id 
       ORDER BY u.first_name ASC`
    );

    // 2. Fetch Logs
    const attendanceRes = await pool.query(
      `SELECT a.*, us.first_name, us.last_name
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users us ON s.user_id = us.user_id
       WHERE EXTRACT(MONTH FROM a.attendance_date) = $1 
         AND EXTRACT(YEAR FROM a.attendance_date) = $2`,
      [month, year]
    );

    res.json({ 
      ok: true, 
      students: studentsRes.rows,
      attendance: attendanceRes.rows,
      logs: attendanceRes.rows // alias for backward compatibility
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Admin Mark Attendance
exports.saveAttendance = async (req, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records)) return res.status(400).json({ ok: false, message: "Invalid records" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const rec of records) {
      // Use UPSERT on student_id + attendance_date + session_number (unique constraint check)
      // For simplicity, we'll just check if exists then update or insert
      const exists = await client.query(
        "SELECT id FROM attendance WHERE student_id = $1 AND attendance_date = $2 AND session_number = $3",
        [rec.student_id, rec.attendance_date, rec.session_number]
      );

      if (exists.rowCount > 0) {
        await client.query(
          `UPDATE attendance SET status = $1, time_slot = $2, instructor_id = $3 
           WHERE id = $4`,
          [rec.status, rec.time_slot, rec.instructor_id, exists.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [rec.student_id, rec.instructor_id, rec.attendance_date, rec.status, rec.session_number, rec.time_slot]
        );
      }
    }
    await client.query("COMMIT");
    res.json({ ok: true, message: "Attendance synchronized successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    client.release();
  }
};

// Clear Attendance history (Admin Only)
exports.clearAttendanceHistory = async (req, res) => {
  try {
    await pool.query("DELETE FROM attendance");
    res.json({ ok: true, message: "Attendance history cleared successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};


/**
 * --- Package Management ---
 */

// Fetch all packages (Admin)
exports.getAdminPackages = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM packages ORDER BY id ASC");
    res.json({ ok: true, packages: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Add new package
exports.addPackage = async (req, res) => {
  const { name, price, description, status } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ ok: false, message: "Package name and price are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO packages (name, price, description, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, parseFloat(price), description, status || 'Active']
    );
    
    // Notify all clients (Home page dynamic updates)
    broadcastPackageUpdate();

    res.status(201).json({ ok: true, package: result.rows[0], message: "Package added successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Edit existing package
exports.editPackage = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE packages SET name = $1, price = $2, description = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [name, parseFloat(price), description, status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Package not found" });
    }

    broadcastPackageUpdate();

    res.json({ ok: true, package: result.rows[0], message: "Package updated successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if any students are enrolled in this package
    const checkRes = await pool.query("SELECT COUNT(*) FROM students WHERE package_id = $1", [id]);
    if (parseInt(checkRes.rows[0].count) > 0) {
      return res.status(400).json({ 
        ok: false, 
        message: "Cannot delete package. Some students are currently enrolled in it." 
      });
    }

    await pool.query("DELETE FROM packages WHERE id = $1", [id]);
    
    broadcastPackageUpdate();

    res.json({ ok: true, message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Database Sync function for Student Seeding
exports.syncDatabaseStudents = async (req, res) => {
  const REAL_STUDENTS = [
      { firstName: "Uthpala", lastName: "Sahan" },
      { firstName: "Sithija", lastName: "Nimsara" },
      { firstName: "Ahsan", lastName: "Madushanka" },
      { firstName: "Nimna", lastName: "Perera" },
      { firstName: "Kavindu", lastName: "Chamod" },
      { firstName: "Nisal", lastName: "Anuhas" },
      { firstName: "Gayesha", lastName: "Nirman" },
      { firstName: "Sumudu", lastName: "Dias" },
      { firstName: "Pasindu", lastName: "Ninada" },
      { firstName: "Dilshan", lastName: "Pawithra" }
  ];

  const client = await pool.connect();
  try {
      await client.query('BEGIN');

      console.log("🧹 DB: Wiping dummy student data...");
      
      const stdUserIdsRes = await client.query("SELECT user_id FROM users WHERE role ILIKE 'Student'");
      const stdUserIds = stdUserIdsRes.rows.map(r => r.user_id);
      
      if (stdUserIds.length > 0) {
          const stdIdsRes = await client.query("SELECT student_id FROM students WHERE user_id = ANY($1)", [stdUserIds]);
          const stdIds = stdIdsRes.rows.map(r => r.student_id);

          if (stdIds.length > 0) {
              await client.query("DELETE FROM attendance WHERE student_id = ANY($1)", [stdIds]);
              await client.query("DELETE FROM sessions WHERE student_id = ANY($1)", [stdIds]);
              await client.query("DELETE FROM reviews WHERE student_id = ANY($1)", [stdIds]);
              await client.query("DELETE FROM payments WHERE student_id = ANY($1)", [stdIds]);
              await client.query("DELETE FROM students WHERE student_id = ANY($1)", [stdIds]);
          }
          await client.query("DELETE FROM users WHERE user_id = ANY($1)", [stdUserIds]);
      }

      console.log("✅ DB: Wiped dummy data. Inserting 10 real students...");
      
      // Dynamically find a valid instructor and package to avoid FK crashes
      const fallbackPkgRes = await client.query("SELECT id FROM packages LIMIT 1");
      const fallbackInsRes = await client.query("SELECT instructor_id FROM instructors WHERE approval_status = 'approved' LIMIT 1");
      
      const packageId = fallbackPkgRes.rows[0]?.id || null; 
      const instructorId = fallbackInsRes.rows[0]?.instructor_id || null; 
      const passwordHash = await bcrypt.hash('123456', 10);

      for (let i = 0; i < REAL_STUDENTS.length; i++) {
          const student = REAL_STUDENTS[i];
          const email = `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}${i}@example.com`;
          const nic = `2000${(10000000 + i).toString().substring(1)}V`;
          const phone = `077${(1000000 + i).toString().substring(1)}`;
          const address = `Colombo, Sri Lanka`;
          
          const userId = `U${Date.now()}${i}`; // Unique generator
          const studentId = `S${Date.now()}${i}`;

          await client.query(
              `INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, tel_no, status, address_line_1, email_verified, created_date)
               VALUES ($1, $2, $3, $4, $5, 'Student', $6, 'active', $7, true, now())`,
              [userId, student.firstName, student.lastName, email, passwordHash, phone, address]
          );

          await client.query(
              `INSERT INTO students (student_id, user_id, package_id, instructor_id, status, progress, nic, address, registered_date)
               VALUES ($1, $2, $3, $4, 'Learning', $5, $6, $7, CURRENT_DATE)`,
              [studentId, userId, packageId, instructorId, Math.floor(Math.random() * 40) + 10, nic, address]
          );
      }

      await client.query('COMMIT');
      
      const { broadcastStudentUpdate } = require("../socket");
      broadcastStudentUpdate();
      
      res.json({ ok: true, message: "Successfully synchronized 10 real students" });
  } catch (err) {
      await client.query('ROLLBACK');
      console.error("❌ DB Migration failed:", err.message);
      res.status(500).json({ ok: false, message: err.message });
  } finally {
      client.release();
  }
};

// --- Financial & Profile Features (New) ---

// Get all student payments & balances
exports.getAdminPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.student_id, 
        u.first_name || ' ' || u.last_name as student_name,
        p.name as package_name,
        p.price as package_price,
        COALESCE(pmt.total_paid, 0) as amount_paid,
        (p.price - COALESCE(pmt.total_paid, 0)) as balance,
        s.status
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN packages p ON s.package_id = p.id
      LEFT JOIN (
        SELECT student_id, SUM(amount) as total_paid 
        FROM payments 
        GROUP BY student_id
      ) pmt ON s.student_id = pmt.student_id
      ORDER BY s.registered_date DESC
    `);

    // Financial Summary Logic
    let totalPotential = 0;
    let totalCollected = 0;
    
    result.rows.forEach(p => {
      totalPotential += parseFloat(p.package_price || 0);
      totalCollected += parseFloat(p.amount_paid || 0);
    });

    res.json({ 
      ok: true, 
      payments: result.rows,
      summary: {
        totalPotential,
        totalCollected,
        totalBalance: totalPotential - totalCollected
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Record a new payment manually
exports.recordStudentPayment = async (req, res) => {
  const { student_id, amount, payment_method } = req.body;
  
  if (!student_id || !amount) {
    return res.status(400).json({ ok: false, message: "Missing student_id or amount" });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 0. Fetch student's package_id and price to check balance
      const stdInfo = await client.query(`
        SELECT s.package_id, p.price, COALESCE(pmt.total_paid, 0) as total_paid
        FROM students s
        JOIN packages p ON s.package_id = p.id
        LEFT JOIN (
           SELECT student_id, SUM(amount) as total_paid FROM payments GROUP BY student_id
        ) pmt ON s.student_id = pmt.student_id
        WHERE s.student_id = $1
      `, [student_id]);

      if (stdInfo.rowCount === 0) throw new Error("Student or associated package not found");
      const { package_id, price, total_paid } = stdInfo.rows[0];
      
      const newTotalPaid = parseFloat(total_paid) + parseFloat(amount);
      const paymentId = `PMT${Date.now()}`;

      // 1. Insert Payment using the correct schema
      await client.query(
        `INSERT INTO payments (payment_id, student_id, package_id, amount, payment_method, status, payment_date, payment_time) 
         VALUES ($1, $2, $3, $4, $5, 'Completed', now(), now())`,
        [paymentId, student_id, package_id, amount, payment_method || 'Manual Admin Entry']
      );

      // 2. Auto-status update (Trigger 'Paid' if balance reached)
      if (newTotalPaid >= parseFloat(price)) {
        await client.query(
          "UPDATE students SET status = 'Paid' WHERE student_id = $1",
          [student_id]
        );
      }

      // 3. Log Activity
      await client.query(
        "INSERT INTO activity_logs (message, type) VALUES ($1, 'payment')",
        [`Payment of Rs. ${amount} recorded for Student ID: ${student_id}. ${newTotalPaid >= price ? 'Account cleared.' : ''}`, 'payment']
      );

      await client.query("COMMIT");
      
      broadcastFinancialUpdate();

      res.json({ ok: true, message: "Payment recorded successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Update Admin Profile Details
exports.updateAdminProfile = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phone, address1, address2, city } = req.body;

  try {
    await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, tel_no = $4,
       address_line_1 = $5, address_line_2 = $6, city = $7
       WHERE user_id = $8`,
      [firstName, lastName, email, phone, address1, address2, city, userId]
    );
    res.json({ ok: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};


