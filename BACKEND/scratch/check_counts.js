const pool = require("../config/db");

async function checkCounts() {
  try {
    const s = await pool.query("SELECT COUNT(*) FROM students");
    const i = await pool.query("SELECT COUNT(*) FROM instructors");
    const v = await pool.query("SELECT COUNT(*) FROM vehicles");
    console.log({
      students: s.rows[0].count,
      instructors: i.rows[0].count,
      vehicles: v.rows[0].count
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCounts();
