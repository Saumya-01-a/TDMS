const { Client } = require('pg');
require('dotenv').config();

async function testSupabase() {
  const host = "db.wanxlzkszeomqwkxdhne.supabase.co"; // Correct host for Supabase direct
  const client = new Client({
    host: host,
    port: 6543, // Transaction Pooler (Recommended)
    database: "postgres",
    user: "postgres",
    password: process.env.DB_PASSWORD, // 810111565
  });

  try {
    console.log(`Connecting to Supabase (${host}:6543)...`);
    await client.connect();
    console.log("✅ SUCCESS! Connected to Supabase via Pooler.");
    await client.end();
  } catch (err) {
    console.error("❌ FAILED to connect to Supabase:", err.message);
  }
}

testSupabase();
