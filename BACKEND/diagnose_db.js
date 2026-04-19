const pool = require("./config/db");

async function diagnose() {
  try {
    console.log("--- DB DIAGNOSIS ---");
    const dbNameRes = await pool.query("SELECT current_database();");
    console.log("Current Database:", dbNameRes.rows[0].current_database);

    const tablesRes = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `);
    console.log("Tables in public schema:", tablesRes.rows.map(r => r.tablename).join(", "));

    const packagesExists = tablesRes.rows.some(r => r.tablename === 'packages');
    console.log("Packages table exists:", packagesExists);

    if (packagesExists) {
      const columnsRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'packages';
      `);
      console.log("Packages columns:", columnsRes.rows.map(r => `${r.column_name} (${r.data_type})`).join(", "));
    }

    const studentsColsRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students';
    `);
    console.log("Students columns:", studentsColsRes.rows.map(r => r.column_name).join(", "));

    process.exit(0);
  } catch (err) {
    console.error("DIAGNOSIS FAILED:", err.message);
    process.exit(1);
  }
}

diagnose();
