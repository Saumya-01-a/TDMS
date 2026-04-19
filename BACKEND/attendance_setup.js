const pool = require('./config/db');
async function run() {
  try {
    console.log('--- Simplified Attendance Creation ---');
    await pool.query(`DROP TABLE IF EXISTS attendance CASCADE`);
    await pool.query(`
      CREATE TABLE attendance (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        instructor_id VARCHAR(50) NOT NULL,
        attendance_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        session_number INTEGER,
        time_slot VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Base Attendance table created');
    
    // Now try adding foreign keys ONE BY ONE
    console.log('Trying FK: students...');
    await pool.query(`ALTER TABLE attendance ADD CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(student_id)`);
    console.log('✅ FK student added');

    console.log('Trying FK: instructors...');
    await pool.query(`ALTER TABLE attendance ADD CONSTRAINT fk_att_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id)`);
    console.log('✅ FK instructor added');

  } catch (err) {
    console.error('FAILED AT:', err.message);
  } finally {
    process.exit(0);
  }
}
run();
