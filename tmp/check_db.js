const path = require('path');
// Load environment variables from BACKEND/.env
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), 'BACKEND', '.env') });

const pool = require(path.join(process.cwd(), 'BACKEND', 'config', 'db'));

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'instructors'
    `);
    const columnNames = res.rows.map(r => r.column_name);
    console.log("Columns in instructors table:", columnNames);
    
    const hasSpecialization = columnNames.includes('specialization');
    if (!hasSpecialization) {
      console.log("Adding specialization column...");
      await pool.query("ALTER TABLE instructors ADD COLUMN specialization VARCHAR(100)");
      console.log("Column added successfully.");
    } else {
      console.log("specialization column already exists.");
    }
    
    // Also check if profile_image_url exists
    const hasProfilePic = columnNames.includes('profile_image_url');
    if (!hasProfilePic) {
      console.log("Adding profile_image_url column...");
      await pool.query("ALTER TABLE instructors ADD COLUMN profile_image_url TEXT");
      console.log("Column added successfully.");
    }
  } catch (err) {
    console.error("Error checking columns:", err);
  } finally {
    await pool.end();
  }
}

checkColumns();
