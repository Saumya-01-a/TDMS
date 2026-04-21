const pool = require('./config/db');

async function seed() {
  try {
    const students = ['S17766009702470', 'S17766009702501', 'S17766009702512'];
    const trialId = 8;
    for (const sId of students) {
      // Check if assignment exists first to avoid error since there's no unique constraint per se or handle conflict
      await pool.query(
        "INSERT INTO trial_exam_assignments (trial_id, student_id, notes) VALUES ($1, $2, $3)",
        [trialId, sId, 'Automatic seed for testing']
      );
    }
    console.log('Seeded 3 assignments for Trial ID 8');
  } catch (err) {
    if (err.code === '23505') {
       console.log('Assignments already exist.');
    } else {
       console.error('Seed Error:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

seed();
