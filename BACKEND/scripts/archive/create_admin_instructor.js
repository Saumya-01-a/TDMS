const pool = require("./config/db");
async function fixDB() {
  try {
    const client = await pool.connect();
    
    // Check if SYSTEM_ADMIN user exists
    const adminCheck = await client.query("SELECT * FROM users WHERE user_id = 'SYSTEM_ADMIN'");
    if (adminCheck.rowCount === 0) {
      await client.query(`
        INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, status, created_date)
        VALUES ('SYSTEM_ADMIN', 'System', 'Admin', 'admin@drivingschool.com', 'hash', 'Admin', 'active', CURRENT_TIMESTAMP)
      `);
      
      await client.query(`
        INSERT INTO instructors (instructor_id, user_id, instructor_reg_no, licence_no, specialization, approval_status, instructor_name, availability_status)
        VALUES ('SYSTEM_ADMIN', 'SYSTEM_ADMIN', 'SYS-000', 'SYS-000', 'System Override', 'approved', 'System Admin', 'available')
      `);
      console.log("SYSTEM_ADMIN created");
    } else {
      const isInstructor = await client.query("SELECT * FROM instructors WHERE instructor_id = 'SYSTEM_ADMIN'");
      if(isInstructor.rowCount === 0){
          await client.query(`
            INSERT INTO instructors (instructor_id, user_id, instructor_reg_no, licence_no, specialization, approval_status, instructor_name, availability_status)
            VALUES ('SYSTEM_ADMIN', 'SYSTEM_ADMIN', 'SYS-000', 'SYS-000', 'System Override', 'approved', 'System Admin', 'available')
          `);
          console.log("SYSTEM_ADMIN created as instructor");
      }
    }
    client.release();
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fixDB();
