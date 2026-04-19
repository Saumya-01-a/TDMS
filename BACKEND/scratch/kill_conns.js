const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  database: "driving_school_db",
  user: "postgres",
  password: "810111565",
});

async function run() {
  try {
    await client.connect();
    console.log("Connected. Terminating other connections...");
    const res = await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE pid <> pg_backend_pid()
      AND datname = 'driving_school_db';
    `);
    console.log(`Terminated ${res.rowCount} connections.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
