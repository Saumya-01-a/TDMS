const pool = require('./config/db');

async function seed() {
  try {
    console.log('--- Attendance Demo Seeding (Perfected Transaction) ---');

    // Start transaction for clean slate
    await pool.query('BEGIN');
    
    await pool.query("DELETE FROM attendance WHERE instructor_id = 'INST-DEFAULT'");
    await pool.query("DELETE FROM students WHERE instructor_id = 'INST-DEFAULT'");
    await pool.query("DELETE FROM instructors WHERE instructor_id = 'INST-DEFAULT'");
    await pool.query("DELETE FROM users WHERE user_id = 'U-DEMO-INS' OR user_id LIKE 'U-STU-%'");

    // 1. Instructor
    await pool.query(`
      INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, status, tel_no, created_date)
      VALUES ('U-DEMO-INS', 'Demo', 'Instructor', 'demo_ins@thesara.com', 'dummyhash', 'Instructor', 'active', '0771234567', CURRENT_DATE)
    `);

    await pool.query(`
      INSERT INTO instructors (instructor_id, user_id, instructor_name, approval_status, availability_status, nic, licence_no, instructor_reg_no)
      VALUES ('INST-DEFAULT', 'U-DEMO-INS', 'Demo Instructor', 'approved', 'Available', '199012345678', 'LIB123456789', 'REG-INS-101')
    `);

    // 2. Students
    const students = [
      ['STU-001', 'Amal', 'Perera', '200112345001'],
      ['STU-002', 'Nimal', 'Silva', '200112345002'],
      ['STU-003', 'Sunil', 'Fernando', '200112345003'],
      ['STU-004', 'Kamal', 'Jayawardena', '200112345004'],
      ['STU-005', 'Aruni', 'Wijesinghe', '200112345005']
    ];

    for (const [id, f, l, nic] of students) {
      const uId = `U-${id}`;
      await pool.query(`
        INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, status, tel_no, created_date)
        VALUES ($1, $2, $3, $4, 'dummy', 'Student', 'active', '0710000000', CURRENT_DATE)
      `, [uId, f, l, `${id}@student.com`]);

      await pool.query(`
        INSERT INTO students (student_id, user_id, instructor_id, progress, status, nic, address, registered_date)
        VALUES ($1, $2, 'INST-DEFAULT', 25, 'Learning', $3, 'Colombo, SL', CURRENT_DATE)
      `, [id, uId, nic]);
    }

    // 3. Attendance Logic
    const slots = ['08:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '03:00 PM - 05:00 PM'];
    for (let day = 1; day <= 5; day++) {
      const date = `2026-04-0${day}`;
      for (const [id] of students) {
         await pool.query(`
           INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot)
           VALUES ($1, 'INST-DEFAULT', $2, 'Present', 1, $3)
         `, [id, date, slots[0]]);
      }
    }

    await pool.query('COMMIT');
    console.log('✅ Demo Environment Successfully Populated (5 Students, 25 Records)');
    console.log('🎉 Please refresh your Attendance Grid.');

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ SEEDING FAILED:', err.message);
    if (err.column) console.error('   Column:', err.column);
    if (err.table) console.error('   Table:', err.table);
    if (err.detail) console.error('   Detail:', err.detail);
  } finally {
    process.exit(0);
  }
}

seed();
