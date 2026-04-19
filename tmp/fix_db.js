// Run this from the root
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env from BACKEND/.env
const envPath = path.join(__dirname, '..', 'BACKEND', '.env');
dotenv.config({ path: envPath });

const pool = require('../BACKEND/config/db');

async function run() {
  try {
    console.log("Checking instructors table...");
    const res = await pool.query("SELECT * FROM instructors LIMIT 1");
    console.log("Current columns:", Object.keys(res.rows[0] || {}));
    
    // Check if specialization exists
    try {
      await pool.query("SELECT specialization FROM instructors LIMIT 1");
      console.log("Specialization column exists.");
    } catch (e) {
      console.log("Adding specialization column...");
      await pool.query("ALTER TABLE instructors ADD COLUMN specialization VARCHAR(100)");
    }

    // Check if profile_image_url exists
    try {
      await pool.query("SELECT profile_image_url FROM instructors LIMIT 1");
      console.log("profile_image_url column exists.");
    } catch (e) {
      console.log("Adding profile_image_url column...");
      await pool.query("ALTER TABLE instructors ADD COLUMN profile_image_url TEXT");
    }
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    await pool.end();
  }
}
run();
