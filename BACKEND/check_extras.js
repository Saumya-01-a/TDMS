const pool = require("./config/db");

async function checkCols() {
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'activity_logs'
  `);
  console.log("activity_logs:", res.rows);

  const res2 = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'instructor_payouts'
  `);
  console.log("instructor_payouts:", res2.rows);

  const res3 = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'lessons'
  `);
  console.log("lessons:", res3.rows);

  process.exit(0);
}

checkCols().catch(console.error);
