const pool = require("./config/db");

async function checkConstraints() {
  const res = await pool.query(`
    SELECT conname, contype, conrelid::regclass, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = 'public'
    ORDER BY conrelid::regclass::text, contype;
  `);
  console.log("CONSTRAINTS:");
  for (const r of res.rows) {
    console.log(`${r.conrelid}: ${r.conname} (${r.contype}) -> ${r.pg_get_constraintdef}`);
  }
  process.exit(0);
}

checkConstraints().catch(console.error);
