const pool = require('./config/db');
const fs = require('fs');

async function checkConstraints() {
  let output = "--- DATABASE CONSTRAINT REPORT ---\n\n";
  
  try {
    const res = await pool.query(`
      SELECT 
          tc.table_name, 
          tc.constraint_name, 
          tc.constraint_type, 
          kcu.column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu 
            ON tc.constraint_name = kcu.constraint_name 
            AND tc.table_schema = kcu.table_schema
      WHERE 
          tc.table_name IN ('users', 'students', 'instructors')
      ORDER BY 
          tc.table_name, tc.constraint_type;
    `);
    
    const tables = {};
    res.rows.forEach(r => {
        if (!tables[r.table_name]) tables[r.table_name] = [];
        tables[r.table_name].push(`${r.column_name} (${r.constraint_type})`);
    });

    for (const [t, constraints] of Object.entries(tables)) {
        output += `[${t}]: ${constraints.join(', ')}\n`;
    }

    fs.writeFileSync('db_constraints.txt', output, 'utf8');
    console.log("Written to db_constraints.txt");

  } catch (e) {
    fs.writeFileSync('db_constraints.txt', "ERROR: " + e.message, 'utf8');
  } finally {
    process.exit(0);
  }
}

checkConstraints();
