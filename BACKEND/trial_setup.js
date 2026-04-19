const pool = require('./config/db');

async function setupTrialSystem() {
  try {
    console.log('--- Trial Exam Management System Setup ---');

    // 1. Trial Exams (Specific dates highlighted by Admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trial_exams (
        id SERIAL PRIMARY KEY,
        trial_date DATE NOT NULL UNIQUE,
        description TEXT,
        status VARCHAR(20) DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ trial_exams table ready');

    // 2. Trial Exam Assignments (Students assigned to dates)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trial_exam_assignments (
        id SERIAL PRIMARY KEY,
        trial_id INTEGER NOT NULL REFERENCES trial_exams(id) ON DELETE CASCADE,
        student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
        instructor_id VARCHAR(50) REFERENCES instructors(instructor_id) ON DELETE SET NULL,
        notes TEXT,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trial_id, student_id)
      )
    `);
    console.log('✅ trial_exam_assignments table ready');

    console.log('--- Setup Completed Successfully ---');
  } catch (err) {
    console.error('❌ Setup FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

setupTrialSystem();
