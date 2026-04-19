const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query(`
      SELECT count(*), state 
      FROM pg_stat_activity 
      GROUP BY state;
    `);
    console.log("Active connections summary:");
    console.table(res.rows);
    
    const maxRes = await client.query("SHOW max_connections;");
    console.log("Max connections allowed:", maxRes.rows[0].max_connections);

    await client.end();
  } catch (err) {
    console.error("Failed to connect:", err.message);
  }
}

check();
