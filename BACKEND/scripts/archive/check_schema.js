const pool = require('./config/db');

async function check() {
  try {
    const tables = ['users', 'students', 'trial_exams', 'trial_exam_assignments'];
    const results = {};
    for (const table of tables) {
      const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table]);
      results[table] = res.rows.map(r => r.column_name);
    }
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
