const pool = require('./config/db');

async function checkNIC() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'instructors' AND column_name = 'nic';
    `);
    if (res.rowCount > 0) {
      console.log("✅ NIC column EXISTS in instructors table.");
      console.log(res.rows[0]);
    } else {
      console.log("❌ NIC column NOT FOUND in instructors table.");
    }

    const res2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'nic';
    `);
    if (res2.rowCount > 0) {
      console.log("✅ NIC column EXISTS in students table.");
      console.log(res2.rows[0]);
    } else {
      console.log("❌ NIC column NOT FOUND in students table.");
    }
  } catch (e) {
    console.error("NIC check failed:", e);
  } finally {
    process.exit(0);
  }
}

checkNIC();
