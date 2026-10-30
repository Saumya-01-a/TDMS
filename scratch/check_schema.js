const path = require('path');
const { Pool } = require(path.join(__dirname, '../BACKEND/node_modules/pg'));
require('dotenv').config({ path: path.join(__dirname, '../BACKEND/.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tdms_db',
  port: process.env.DB_PORT || 5432,
});

async function checkSchema() {
  const tables = ['users', 'students', 'instructors', 'vehicles', 'packages', 'attendance', 'payments', 'study_materials', 'notifications'];
  for (const t of tables) {
    try {
      const cols = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [t]);
      console.log('=== TABLE: ' + t + ' ===');
      console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    } catch (e) {
      console.log('Error checking table ' + t + ': ' + e.message);
    }
  }

  // Also check foreign keys and constraints
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

  // Also check packages in database
  const pkgs = await pool.query('SELECT * FROM packages');
  console.log('\n=== PACKAGES ===');
  console.log(pkgs.rows);

  pool.end();
}

checkSchema().catch(console.error);

