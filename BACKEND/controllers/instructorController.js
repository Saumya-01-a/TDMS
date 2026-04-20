const pool = require('../config/db');
const fs = require('fs');
const { broadcastInstructorStatus, broadcastStudentUpdate, sendNotificationToUser } = require('../socket');
const supabase = require('../config/supabaseClient');

exports.uploadMaterial = async (req, res) => {
  const { title, instructorId, category, description } = req.body;
  const file = req.file;

  if (!file || !title || !instructorId) {
    return res.status(400).json({ ok: false, message: "Missing required fields" });
  }

  // 1. Enforce strict categorization
  const validCategories = ['Road Signs', 'Traffic Rules', 'Vehicle Operation', 'Past Papers'];
  const finalCategory = validCategories.includes(category) ? category : 'Past Papers'; // Default to something useful

  try {
    const fileBuffer = file.buffer;
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // 2. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(`materials/${fileName}`, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(`materials/${fileName}`);

    // 4. Save to Database
    await pool.query(
      `INSERT INTO materials (title, file_url, instructor_id, category, description) VALUES ($1, $2, $3, $4, $5)`,
      [title, publicUrl, instructorId, finalCategory, description || 'Study resource for driving school students.']
    );

    res.json({ ok: true, message: "Material published successfully!", url: publicUrl });
  } catch (err) {
    console.error("🏁 MATERIAL UPLOAD FAILURE:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get the file URL to delete from Supabase
    const materialRes = await pool.query("SELECT file_url FROM materials WHERE material_id = $1", [id]);
    if (materialRes.rowCount === 0) return res.status(404).json({ ok: false, message: "Material not found" });

    const fileUrl = materialRes.rows[0].file_url;
    // Extract properly even if query params are present
    const urlParts = fileUrl.split('/');
    const fileNameWithQuery = urlParts.pop();
    const fileName = fileNameWithQuery.split('?')[0];

    console.log(`🗑️ ATTEMPTING PURGE: materials/${fileName} from ${process.env.SUPABASE_BUCKET}`);

    // 2. Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([`materials/${fileName}`]);

    if (deleteError) throw deleteError;

    // 3. Delete from Database
    await pool.query("DELETE FROM materials WHERE material_id = $1", [id]);

    res.json({ ok: true, message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materials ORDER BY category, title ASC");
    res.json({ ok: true, materials: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I')) {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const totalStudentsData = await pool.query("SELECT COUNT(*) FROM students");
    const yourStudentsData = await pool.query(
      "SELECT COUNT(*) FROM students WHERE instructor_id = $1 OR user_id = $1",
      [finalId]
    );
    
    // Use lessons table instead of sessions
    const todaySessionsData = await pool.query(
      "SELECT COUNT(*) FROM lessons WHERE (instructor_id = $1) AND lesson_date = CURRENT_DATE",
      [finalId]
    );

    res.json({
      ok: true,
      stats: {
        totalStudents: parseInt(totalStudentsData.rows[0].count),
        yourStudents: parseInt(yourStudentsData.rows[0].count),
        todaySessions: parseInt(todaySessionsData.rows[0].count),
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.getWeeklySchedule = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I') && instructorId !== 'INST-DEFAULT') {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    // Use lessons table and expand range to full month for "April 2026" visibility
    const result = await pool.query(
      `SELECT l.*, u.first_name, u.last_name 
       FROM lessons l
       JOIN students s ON l.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE l.instructor_id = $1 
       AND l.lesson_date >= date_trunc('month', CURRENT_DATE) 
       AND l.lesson_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
       ORDER BY l.lesson_date, l.session_number`,
      [finalId]
    );
    
    res.json({ ok: true, schedule: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.updateAvailability = async (req, res) => {
  const { instructorId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ ok: false, message: "New status is required" });
  }

  try {
    await pool.query(
      "UPDATE instructors SET availability_status = $1 WHERE instructor_id = $2",
      [status, instructorId]
    );

    // ✅ Broadcast real-time status change
    broadcastInstructorStatus(instructorId, status);

    res.json({ ok: true, message: "Availability updated successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// --- Student Management (Instructor Context) ---

// Get all students assigned to an instructor
exports.getInstructorStudents = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I')) {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email, u.tel_no, p.name as package_name
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN packages p ON s.package_id = p.id
       WHERE s.instructor_id = $1 OR s.user_id = $1
       ORDER BY s.registered_date DESC`,
      [finalId]
    );
    res.json({ ok: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Get student metrics (Total, Active, Inactive)
exports.getInstructorStudentStats = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I')) {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const total = await pool.query("SELECT COUNT(*) FROM students WHERE instructor_id = $1", [finalId]);
    const learning = await pool.query("SELECT COUNT(*) FROM students WHERE instructor_id = $1 AND status = 'Learning'", [finalId]);
    const inactive = await pool.query("SELECT COUNT(*) FROM students WHERE instructor_id = $1 AND status = 'Inactive'", [finalId]);
    const completed = await pool.query("SELECT COUNT(*) FROM students WHERE instructor_id = $1 AND status = 'Completed'", [finalId]);

    res.json({
      ok: true,
      stats: {
        total: parseInt(total.rows[0].count),
        active: parseInt(learning.rows[0].count),
        inactive: parseInt(inactive.rows[0].count),
        completed: parseInt(completed.rows[0].count)
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Get all available packages
exports.getPackages = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM packages ORDER BY price ASC");
    res.json({ ok: true, packages: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Update student progress (Instructor Context)
 * Verifies student is assigned to this instructor.
 */
exports.updateStudentProgressInstructor = async (req, res) => {
  const { studentId } = req.params;
  const { progress, instructorId } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ ok: false, message: "Valid progress (0-100) required" });
  }

  try {
     // 🔍 Resolve ID
     let finalInsId = instructorId;
     if (!instructorId.startsWith('I')) {
        const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
        if (insLookup.rowCount > 0) finalInsId = insLookup.rows[0].instructor_id;
     }

    // Verify assignment
    const check = await pool.query("SELECT * FROM students WHERE student_id = $1 AND instructor_id = $2", [studentId, finalInsId]);
    if (check.rowCount === 0) return res.status(403).json({ ok: false, message: "Unauthorized. Student not assigned to you." });

    const status = progress === 100 ? 'Completed' : 'Learning';
    await pool.query(
      "UPDATE students SET progress = $1, status = $2 WHERE student_id = $3",
      [progress, status, studentId]
    );
    
    broadcastStudentUpdate();
    res.json({ ok: true, message: "Progress updated successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Mark student as Completed (Instructor Context)
 */
exports.completeLicenseInstructor = async (req, res) => {
  const { studentId } = req.params;
  const { instructorId } = req.body;

  try {
     // 🔍 Resolve ID
     let finalInsId = instructorId;
     if (!instructorId.startsWith('I')) {
        const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
        if (insLookup.rowCount > 0) finalInsId = insLookup.rows[0].instructor_id;
     }

    const check = await pool.query("SELECT user_id FROM students WHERE student_id = $1 AND instructor_id = $2", [studentId, finalInsId]);
    if (check.rowCount === 0) return res.status(403).json({ ok: false, message: "Unauthorized. Student not assigned to you." });

    const studentUserId = check.rows[0].user_id;

    await pool.query(
      "UPDATE students SET status = 'Completed', progress = 100, completion_date = CURRENT_TIMESTAMP WHERE student_id = $1",
      [studentId]
    );

    // Create Notification using standard system admin ID or system context
    const msg = "Congratulations! Your instructor has marked your training as Completed.";
    const notifId = 'NOTIF-' + Date.now();
    await pool.query(
      `INSERT INTO notifications (notification_id, recipient_id, sender_id, subject, message, category, priority, status)
       VALUES ($1, $2, 'SYSTEM', 'Course Completed', $3, 'success', 'high', 'unread')`,
      [notifId, studentUserId, msg]
    );

    broadcastStudentUpdate();
    res.json({ ok: true, message: "Student marked as completed. Records synchronized." });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// --- Attendance Management ---

// Fetch monthly attendance for the register grid
exports.getMonthlyAttendance = async (req, res) => {
  const { instructorId, year, month } = req.params;
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month

  try {
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I')) {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE (a.instructor_id = $1 OR a.instructor_id = 'INST-DEFAULT')
         AND a.attendance_date >= $2 
         AND a.attendance_date <= $3
       ORDER BY a.attendance_date ASC`,
      [finalId, startDate, endDate]
    );
    res.json({ ok: true, attendance: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Bulk Save Attendance
exports.saveAttendance = async (req, res) => {
  const { records } = req.body; // Array of { student_id, instructor_id, date, status, session_number, time_slot }

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ ok: false, message: "Invalid records format" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const rec of records) {
      // 1. Insert/Update Attendance
      await client.query(
        `INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, attendance_date, session_number)
         DO UPDATE SET status = EXCLUDED.status, time_slot = EXCLUDED.time_slot`,
        [rec.student_id, rec.instructor_id, rec.attendance_date, rec.status, rec.session_number, rec.time_slot]
      );

      // 2. If 'Present', increment student progress (5% per lesson)
      if (rec.status === 'Present') {
        await client.query(
          `UPDATE students 
           SET progress = LEAST(progress + 5, 100),
               status = CASE WHEN progress + 5 >= 100 THEN 'Completed' ELSE 'Learning' END
           WHERE student_id = $1`,
          [rec.student_id]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ ok: true, message: "Attendance and Progress synced successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    client.release();
  }
};

// Fetch attendance history for the summary table
exports.getAttendanceHistory = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // 🔍 Resolve ID
    let finalId = instructorId;
    if (!instructorId.startsWith('I') && instructorId !== 'INST-DEFAULT') {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const result = await pool.query(
      `SELECT a.*, u.first_name, u.last_name
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE a.instructor_id = $1 OR a.instructor_id = 'INST-DEFAULT'
       ORDER BY a.attendance_date DESC, a.created_at DESC
       LIMIT 50`,
      [finalId]
    );
    res.json({ ok: true, history: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Fetch assigned lesson schedule for an instructor
exports.getInstructorLessons = async (req, res) => {
  const { instructorId } = req.params;

  try {
    // 🔍 Resolve ID: Find instructor_id if a user_id (UUID) was provided
    let finalId = instructorId;
    if (!instructorId.startsWith('I') && instructorId !== 'INST-DEFAULT') {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    const result = await pool.query(
      `SELECT l.*, 
              u.first_name as student_fname, u.last_name as student_lname,
              v.registration_number as vehicle_reg
       FROM lessons l
       JOIN students s ON l.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN vehicles v ON l.vehicle_id = v.vehicle_id
       WHERE l.instructor_id = $1 OR l.instructor_id = 'INST-DEFAULT'
       ORDER BY l.lesson_date DESC, l.session_number ASC`,
      [finalId]
    );
    res.json({ ok: true, lessons: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Update lesson status (Instructor Context: Mark Completed/Cancelled)
 */
exports.updateLessonStatusInstructor = async (req, res) => {
  const { lessonId } = req.params;
  const { status, instructorId } = req.body;

  if (!status) return res.status(400).json({ ok: false, message: "Status is required" });

  try {
    // 🔍 Resolve ID
    let finalId = instructorId;
    if (instructorId && !instructorId.startsWith('I') && instructorId !== 'INST-DEFAULT') {
       const insLookup = await pool.query("SELECT instructor_id FROM instructors WHERE user_id = $1", [instructorId]);
       if (insLookup.rowCount > 0) finalId = insLookup.rows[0].instructor_id;
    }

    // Update
    const result = await pool.query(
      "UPDATE lessons SET status = $1 WHERE id = $2 RETURNING *",
      [status, lessonId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Lesson not found" });
    }

    res.json({ ok: true, message: `Lesson marked as ${status}`, lesson: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// --- New Admin & Profile Features ---

/**
 * Fetch Full profile data for the Profile Page
 * Includes sensitive info like NIC, License
 */
exports.getInstructorFullProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, u.email, u.tel_no, u.address_line_1, u.address_line_2, u.city,
              i.instructor_id, i.instructor_reg_no, i.specialization, i.profile_image_url, i.nic, i.licence_no
       FROM users u
       LEFT JOIN instructors i ON u.user_id = i.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Instructor profile not found" });
    }

    res.json({ ok: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Update Instructor Profile (RESTRICTED to Email, Phone)
 */
exports.updateInstructorProfile = async (req, res) => {
  const { userId } = req.params;
  const { email, phone, addressLine1, addressLine2, city } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET email = COALESCE($1, email),
           tel_no = COALESCE($2, tel_no),
           address_line_1 = COALESCE($3, address_line_1),
           address_line_2 = COALESCE($4, address_line_2),
           city = COALESCE($5, city)
       WHERE user_id = $6 RETURNING *`,
      [email, phone, addressLine1, addressLine2, city, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    res.json({ ok: true, message: "Profile updated successfully (restricted fields only)", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Update Instructor Profile Image using Supabase Storage
 */
exports.updateInstructorProfileImage = async (req, res) => {
  const { userId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ ok: false, message: "No image file provided" });
  }

  try {
    const fileBuffer = file.buffer;
    const fileName = `profile-${userId}-${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(`profiles/${fileName}`, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(`profiles/${fileName}`);

    // Update instructors table
    await pool.query(
      "UPDATE instructors SET profile_image_url = $1 WHERE user_id = $2",
      [publicUrl, userId]
    );

    res.json({ ok: true, message: "Profile image updated successfully", imageUrl: publicUrl });
  } catch (err) {
    console.error("Profile Image Upload Error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Fetch Instructor Info for the Student Dashboard (LIMITED)
 */
exports.getStudentInstructor = async (req, res) => {
  const { studentUserId } = req.params;

  try {
    const result = await pool.query(
      `SELECT u_i.first_name, u_i.last_name, u_i.tel_no, i.specialization, i.profile_image_url
       FROM students s
       JOIN instructors i ON s.instructor_id = i.instructor_id
       JOIN users u_i ON i.user_id = u_i.user_id
       WHERE s.user_id = $1`,
      [studentUserId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "No instructor assigned to this student" });
    }

    res.json({ ok: true, instructor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Fetch minimal profile data for the Sidebar
 * Includes Real Name and Instructor ID
 */
exports.getInstructorMinimalProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, i.instructor_id, i.instructor_reg_no, i.verification_document as profile_image
       FROM users u
       LEFT JOIN instructors i ON u.user_id = i.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const row = result.rows[0];
    res.json({ 
      ok: true, 
      profile: {
        first_name: row.first_name,
        last_name: row.last_name,
        instructor_id: row.instructor_id || `ID-PENDING-${userId}`,
        profile_image: row.profile_image
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Permanent deletion of session logs (attendance history)
 */
exports.clearAttendanceHistory = async (req, res) => {
  const { instructorId } = req.params;
  try {
    await pool.query("DELETE FROM attendance WHERE instructor_id = $1", [instructorId]);
    res.json({ ok: true, message: "All session logs have been cleared permanently." });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Export monthly attendance to a CSV file
 */
exports.exportAttendanceCSV = async (req, res) => {
  const { instructorId, year, month } = req.params;
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT a.attendance_date, u.first_name, u.last_name, a.session_number, a.status, a.time_slot
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE a.instructor_id = $1 
         AND a.attendance_date >= $2 
         AND a.attendance_date <= $3
       ORDER BY a.attendance_date ASC, a.session_number ASC`,
      [instructorId, startDate, endDate]
    );

    // Generate CSV Content
    let csvContent = "Date,Student Name,Session,Time Slot,Status\n";
    result.rows.forEach(row => {
      const formattedDate = new Date(row.attendance_date).toLocaleDateString('en-GB');
      const fullName = `${row.first_name} ${row.last_name}`;
      csvContent += `"${formattedDate}","${fullName}","Session ${row.session_number}","${row.time_slot || ''}","${row.status}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`Attendance_Report_${year}_${month}.csv`);
    return res.send(csvContent);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Fetch All Instructors with full details for Admin Audit
 */
exports.getAllInstructorsForAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, u.email, u.tel_no, u.address_line_1, u.address_line_2, u.city,
              i.instructor_id, i.instructor_reg_no, i.specialization, i.profile_image_url, i.nic, i.licence_no, i.approval_status
       FROM users u
       JOIN instructors i ON u.user_id = i.user_id
       ORDER BY u.first_name ASC`
    );
    res.json({ ok: true, instructors: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Fetch all vehicles with instructor mapping for Instructor View
 */
exports.getVehiclesInstructor = async (req, res) => {
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

/**
 * Get Latest Vehicle Location for Instructor View
 */
exports.getVehicleLocationInstructor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT lat, lng, speed, created_at FROM gps_logs WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Vehicle not currently broadcasting location data" });
    }
    res.json({ ok: true, location: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

module.exports = exports;
