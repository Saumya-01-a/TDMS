const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'driving_school_db',
  password: '810111565',
  port: 5432,
});

async function seed() {
  try {
    console.log('Seeding Instructor Notifications...');
    
    // Get all instructors
    const instructors = await pool.query("SELECT user_id FROM users WHERE role = 'Instructor'");
    console.log(`Found ${instructors.rows.length} instructors.`);

    for (const inst of instructors.rows) {
      const recipientId = inst.user_id;
      const notifs = [
        {
          id: `NOTIF_INST_1_${Date.now()}_${recipientId}`,
          subject: 'Weekly Schedule Updated',
          message: 'Your training schedule for the upcoming week has been finalized. Please check the Schedule tab for your assigned sessions.',
          category: 'info',
          priority: 'normal'
        },
        {
          id: `NOTIF_INST_2_${Date.now()}_${recipientId}`,
          subject: 'Vehicle Maintenance Alert',
          message: 'Vehicle CAR-7722 (Assigned to you) is due for servicing tomorrow. Please pick up your temporary replacement from the fleet manager at 08:00 AM.',
          category: 'warning',
          priority: 'urgent'
        },
        {
          id: `NOTIF_INST_3_${Date.now()}_${recipientId}`,
          subject: 'New Student Assignment',
          message: 'Trainee "Himaya Silva" has been assigned to your driving sessions. Please review her progress profile before the first session.',
          category: 'success',
          priority: 'normal'
        },
        {
          id: `NOTIF_INST_4_${Date.now()}_${recipientId}`,
          subject: 'Administrative Policy Update',
          message: 'A new policy regarding digital attendance marking is now in effect. Please ensure all sessions are logged in real-time.',
          category: 'info',
          priority: 'normal'
        },
        {
          id: `NOTIF_INST_5_${Date.now()}_${recipientId}`,
          subject: 'Instructor Payout Confirmed',
          message: 'Your monthly teaching incentives have been calculated and transferred to your bank account. View details in your payouts tab.',
          category: 'success',
          priority: 'normal'
        }
      ];

      for (const n of notifs) {
        await pool.query(
          `INSERT INTO notifications (notification_id, recipient_id, sender_id, message, subject, priority, category, status, date_sent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'unread', now())
           ON CONFLICT (notification_id) DO NOTHING`,
          [n.id, recipientId, 'SYSTEM_ADMIN', n.message, n.subject, n.priority, n.category]
        );
      }
    }

    console.log('Seed Complete!');
  } catch (err) {
    console.error('Seed Error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
