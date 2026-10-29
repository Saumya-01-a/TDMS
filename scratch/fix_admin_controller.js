const fs = require('fs');

const filePath = 'BACKEND/controllers/adminController.js';
let raw = fs.readFileSync(filePath, 'utf8');
const isCrlf = raw.includes('\r\n');
let norm = raw.replace(/\r\n/g, '\n');

const target = `// Fetch all attendance logs with joined names
exports.getAllAttendanceLogs = async (req, res) => {
  try {
// Fetch All Attendance Logs (Flattened for Audit Table)
exports.getAllAttendanceLogs = async (req, res) => {
  try {
    const result = await pool.query(
      \`SELECT a.*, 
              us.first_name, us.last_name,
              ui.first_name as instructor_fname, ui.last_name as instructor_lname
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users us ON s.user_id = us.user_id
       LEFT JOIN instructors i ON a.instructor_id = i.instructor_id
       LEFT JOIN users ui ON i.user_id = ui.user_id
       ORDER BY a.attendance_date DESC, a.created_at DESC
       LIMIT 100\`
    );
    res.json({ ok: true, logs: result.rows, history: result.rows }); // history alias for frontend compatibility
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};`;

const replacement = `// Fetch All Attendance Logs (Flattened for Audit Table)
exports.getAllAttendanceLogs = async (req, res) => {
  try {
    const result = await pool.query(
      \`SELECT a.*, 
              us.first_name, us.last_name,
              ui.first_name as instructor_fname, ui.last_name as instructor_lname
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       JOIN users us ON s.user_id = us.user_id
       LEFT JOIN instructors i ON a.instructor_id = i.instructor_id
       LEFT JOIN users ui ON i.user_id = ui.user_id
       ORDER BY a.attendance_date DESC, a.created_at DESC
       LIMIT 100\`
    );
    res.json({ ok: true, logs: result.rows, history: result.rows });
  } catch (err) {
    console.error("Error in getAllAttendanceLogs:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};`;

if (norm.includes(target)) {
  norm = norm.replace(target, replacement);
  fs.writeFileSync(filePath, isCrlf ? norm.replace(/\n/g, '\r\n') : norm, 'utf8');
  console.log('Successfully fixed getAllAttendanceLogs in adminController.js');
} else {
  console.error('Target not found in adminController.js');
}

