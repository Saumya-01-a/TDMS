const pool = require('./config/db');
async function run() {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  const tables = res.rows.map(r => r.table_name);
  console.log("TABLES:", tables);
  console.log("PAYMENTS EXIST:", tables.includes('payments'));
  console.log("PAYOUTS EXIST:", tables.includes('instructor_payouts'));
  process.exit();
}
run();
