const pool = require("../config/db");
const { sendNotificationToUser } = require("../socket");

exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT n.*, u.first_name || ' ' || u.last_name as sender_name, u.role as sender_role 
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.user_id
       WHERE n.recipient_id = $1 
       ORDER BY n.created_at DESC`,
      [userId]
    );
    res.json({ ok: true, notifications: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE notifications SET is_read = true WHERE id = $1", [id]);
    res.json({ ok: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE recipient_id = $1",
      [userId]
    );
    res.json({ ok: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.clearAll = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query("DELETE FROM notifications WHERE recipient_id = $1", [userId]);
    res.json({ ok: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Bulk delete notifications
exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ ok: false, message: "No IDs provided" });
  }
  try {
    await pool.query("DELETE FROM notifications WHERE id = ANY($1::int[])", [ids]);
    res.json({ ok: true, message: "Selected notifications deleted" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Bulk mark as read
exports.bulkRead = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ ok: false, message: "No IDs provided" });
  }
  try {
    await pool.query("UPDATE notifications SET is_read = true WHERE id = ANY($1::int[])", [ids]);
    res.json({ ok: true, message: "Selected notifications marked as read" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Admin Message Composer (Individual or Bulk)
exports.createNotification = async (req, res) => {
  const { recipientId, recipientRole, message, subject, type, category, priority, senderId } = req.body;
  
  try {
    const notifications = [];
    
    if (recipientRole === 'All Students' || recipientRole === 'All Instructors') {
      const targetRole = recipientRole === 'All Students' ? 'Student' : 'Instructor';
      const users = await pool.query("SELECT user_id FROM users WHERE role = $1", [targetRole]);
      
      for (const user of users.rows) {
        const result = await pool.query(
          "INSERT INTO notifications (recipient_id, sender_id, message, subject, priority, category, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [user.user_id, senderId || 'SYSTEM', message, subject || '', priority || 'normal', category || 'info', type || 'info']
        );
        notifications.push(result.rows[0]);
        sendNotificationToUser(user.user_id, result.rows[0]);
      }
    } else if (recipientId) {
      const result = await pool.query(
        "INSERT INTO notifications (recipient_id, sender_id, message, subject, priority, category, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [recipientId, senderId || 'SYSTEM', message, subject || '', priority || 'normal', category || 'info', type || 'info']
      );
      notifications.push(result.rows[0]);
      sendNotificationToUser(recipientId, result.rows[0]);
    }

    res.json({ ok: true, message: "Notification(s) sent successfully", count: notifications.length });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Search users for the message composer
exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      "SELECT user_id, first_name, last_name, role FROM users WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR user_id ILIKE $1) AND role != 'Admin' LIMIT 10",
      [`%${query}%`]
    );
    res.json({ ok: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
