const pool = require("./config/db");

async function inspect() {
  const tables = ['users', 'students', 'instructors', 'vehicles', 'packages', 'attendance', 'payments', 'study_materials', 'notifications', 'appointments', 'trial_exams'];
  for (const t of tables) {
    try {
      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [t]);
      if (cols.rows.length > 0) {
        const countRes = await pool.query(`SELECT COUNT(*) FROM public."${t}"`);
        console.log(`\n=== TABLE: ${t} (${countRes.rows[0].count} rows) ===`);
        console.log(cols.rows.map(c => `${c.column_name} (${c.data_type}${c.is_nullable === 'NO' ? ' NOT NULL' : ''})`).join(', '));
      } else {
        console.log(`\n=== TABLE: ${t} (DOES NOT EXIST) ===`);
      }
    } catch (e) {
      console.log(`Error checking ${t}: ${e.message}`);
    }
  }

  // Also check foreign keys
  const fks = await pool.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name;
  `);
  console.log('\n=== FOREIGN KEYS ===');
  for (const r of fks.rows) {
    console.log(`${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`);
  }

  // Sample a row from each table if it has rows
  for (const t of tables) {
    try {
      const sample = await pool.query(`SELECT * FROM public."${t}" LIMIT 1`);
      if (sample.rows.length > 0) {
        console.log(`\n--- Sample from ${t}: ---`);
        console.log(sample.rows[0]);
      }
    } catch (e) {}
  }

  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
