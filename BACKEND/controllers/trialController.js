const pool = require('../config/db');
const { broadcastTrialUpdate, sendNotificationToUser } = require('../socket');

/**
 * Toggle a date as a trial period (High-level date management)
 */
exports.toggleTrialDate = async (req, res) => {
  const { trial_date, description } = req.body;
  try {
    const existing = await pool.query("SELECT * FROM trial_exams WHERE trial_date = $1", [trial_date]);

    if (existing.rowCount > 0) {
      await pool.query("DELETE FROM trial_exams WHERE trial_date = $1", [trial_date]);
      broadcastTrialUpdate({ type: 'DATE_REMOVED', date: trial_date });
      return res.json({ ok: true, action: 'removed' });
    } else {
      const result = await pool.query(
        "INSERT INTO trial_exams (trial_date, description) VALUES ($1, $2) RETURNING *",
        [trial_date, description || 'Standard Trial Session']
      );
      broadcastTrialUpdate({ type: 'DATE_ADDED', trial: result.rows[0] });
      return res.json({ ok: true, action: 'added', trial: result.rows[0] });
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Fetch all highlighted trial dates
 */
exports.getTrialDates = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trial_exams ORDER BY trial_date ASC");
    res.json({ ok: true, trials: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get assigned students for a specific trial
 */
exports.getTrialStudents = async (req, res) => {
  const { trialId } = req.params;
  try {
    const result = await pool.query(`
      SELECT tea.*, s.first_name, s.last_name, s.profile_image, p.name as package_name
      FROM trial_exam_assignments tea
      JOIN students s ON tea.student_id = s.student_id
      LEFT JOIN packages p ON s.package_id = p.id
      WHERE tea.trial_id = $1
    `, [trialId]);
    res.json({ ok: true, students: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Assign a student to a trial date
 */
exports.assignStudent = async (req, res) => {
  const { trialId, studentId, instructorId, notes } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO trial_exam_assignments (trial_id, student_id, instructor_id, notes) VALUES ($1, $2, $3, $4) RETURNING *",
      [trialId, studentId, instructorId, notes]
    );

    // Get trial date for notification
    const trialRes = await pool.query("SELECT trial_date FROM trial_exams WHERE id = $1", [trialId]);
    const trialDate = trialRes.rows[0].trial_date;

    // Real-time Update for dashboards
    broadcastTrialUpdate({ type: 'ASSIGNMENT_CREATED', studentId, trialDate });

    // Internal Dashboard Notification
    sendNotificationToUser(studentId, {
      title: 'Trial Date Assigned!',
      message: `Your trial examination has been scheduled for ${new Date(trialDate).toLocaleDateString()}.`,
      type: 'success'
    });

    res.status(201).json({ ok: true, assignment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Remove a student from a trial date
 */
exports.removeStudent = async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const res_data = await pool.query("SELECT * FROM trial_exam_assignments WHERE id = $1", [assignmentId]);
    if (res_data.rowCount === 0) return res.status(404).json({ ok: false, message: "Assignment not found" });

    const studentId = res_data.rows[0].student_id;

    await pool.query("DELETE FROM trial_exam_assignments WHERE id = $1", [assignmentId]);

    broadcastTrialUpdate({ type: 'ASSIGNMENT_REMOVED', studentId });

    sendNotificationToUser(studentId, {
      title: 'Trial Date Cancelled',
      message: `Your scheduled trial examination has been removed. Contact office for details.`,
      type: 'warning'
    });

    res.json({ ok: true, message: "Student removed from trial." });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Global Stats for Dashboards
 */
exports.getTrialStats = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM trial_exams WHERE trial_date >= CURRENT_DATE");
    res.json({ ok: true, upcomingCount: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
