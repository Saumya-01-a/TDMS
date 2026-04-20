const pool = require("../config/db");
const { sendNotificationToUser } = require("../socket");

// Get all notifications for a user (Standardized Columns)
exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    // 🔍 Resolve if user is Admin to include SYSTEM_ADMIN bucket
    const userLookup = await pool.query("SELECT role FROM users WHERE user_id = $1", [userId]);
    const isAdmin = userLookup.rowCount > 0 && userLookup.rows[0].role === 'Admin';

    const result = await pool.query(
      `SELECT n.*, u.first_name || ' ' || u.last_name as sender_name, u.role as sender_role 
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.user_id
       WHERE n.recipient_id = $1 
       OR ($2 = true AND n.recipient_id = 'SYSTEM_ADMIN')
       ORDER BY n.date_sent DESC`,
      [userId, isAdmin]
    );
    res.json({ ok: true, notifications: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params; // notification_id
  try {
    await pool.query("UPDATE notifications SET status = 'read' WHERE notification_id = $1", [id]);
    res.json({ ok: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query(
      "UPDATE notifications SET status = 'read' WHERE recipient_id = $1",
      [userId]
    );
    res.json({ ok: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Clear all
exports.clearAll = async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query("DELETE FROM notifications WHERE recipient_id = $1", [userId]);
    res.json({ ok: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Bulk delete notifications (Corrected Column & Casting)
exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ ok: false, message: "No IDs provided" });
  }
  try {
    await pool.query("DELETE FROM notifications WHERE notification_id = ANY($1::text[])", [ids]);
    res.json({ ok: true, message: "Selected notifications deleted" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Bulk mark as read (Corrected Column & Casting)
exports.bulkRead = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ ok: false, message: "No IDs provided" });
  }
  try {
    await pool.query("UPDATE notifications SET status = 'read' WHERE notification_id = ANY($1::text[])", [ids]);
    res.json({ ok: true, message: "Selected notifications marked as read" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Admin Message Composer (Individual or Bulk)
exports.createNotification = async (req, res) => {
  const { recipientId, recipientRole, message, subject, category, priority, senderId } = req.body;
  
  try {
    const notifications = [];
    const notifIdPrefix = 'NOTIF' + Date.now();
    
    if (recipientRole === 'All Students' || recipientRole === 'All Instructors') {
      const targetRole = recipientRole === 'All Students' ? 'Student' : 'Instructor';
      const users = await pool.query("SELECT user_id FROM users WHERE role = $1", [targetRole]);
      
      for (let i = 0; i < users.rows.length; i++) {
        const user = users.rows[i];
        const uniqueId = `${notifIdPrefix}${i}`;
        
        const result = await pool.query(
          `INSERT INTO notifications (notification_id, recipient_id, sender_id, message, subject, priority, category, status, date_sent) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'unread', now()) RETURNING *`,
          [uniqueId, user.user_id, senderId || 'SYSTEM', message, subject || '', priority || 'normal', category || 'info']
        );
        notifications.push(result.rows[0]);
        sendNotificationToUser(user.user_id, result.rows[0]);
      }
    } else if (recipientId) {
      const result = await pool.query(
        `INSERT INTO notifications (notification_id, recipient_id, sender_id, message, subject, priority, category, status, date_sent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'unread', now()) RETURNING *`,
        [notifIdPrefix, recipientId, senderId || 'SYSTEM', message, subject || '', priority || 'normal', category || 'info']
      );
      notifications.push(result.rows[0]);
      sendNotificationToUser(recipientId, result.rows[0]);
    }

    res.json({ ok: true, message: "Notification(s) sent successfully", count: notifications.length });
  } catch (err) {
    console.error("Notif Error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

// Delete single notification
exports.deleteSingle = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM notifications WHERE notification_id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Notification not found" });
    }
    res.json({ ok: true, message: "Notification deleted" });
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
