const pool = require("../config/db");

async function test() {
  try {
    const client = await pool.connect();
    console.log("SUCCESS: Connected to DB!");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

test();
