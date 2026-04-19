const pool = require('./config/db');

const vehicles = [
  // AUTO SECTION
  { model: 'Toyota Vios', type: 'Car', registration_number: 'WP CAS-90XX', year: 2022, transmission: 'Auto', status: 'Available' },
  { model: 'TVS Apache', type: 'Bike', registration_number: 'WP BIW-45XX', year: 2023, transmission: 'Auto', status: 'Available' },
  
  // MANUAL SECTION
  { model: 'Toyota Vios', type: 'Car', registration_number: 'WP CAT-11XX', year: 2023, transmission: 'Manual', status: 'Available' },
  { model: 'Toyota Hiace', type: 'Van', registration_number: 'WP PH-23XX', year: 2021, transmission: 'Manual', status: 'Available' },
  { model: 'Honda Navis', type: 'Bike', registration_number: 'WP BJL-09XX', year: 2022, transmission: 'Manual', status: 'Available' },
  { model: 'TVS Apache', type: 'Bike', registration_number: 'WP BKB-77XX', year: 2024, transmission: 'Manual', status: 'Available' },
  { model: 'Bajaj RE', type: 'Three-wheel', registration_number: 'EP QV-12XX', year: 2021, transmission: 'Manual', status: 'Available' },
  { model: 'Bajaj RE', type: 'Three-wheel', registration_number: 'WP QW-44XX', year: 2023, transmission: 'Manual', status: 'Available' }
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log("🛠️ Dropping and recreating vehicles table with TRANSMISSION column...");
    await client.query('DROP TABLE IF EXISTS vehicles CASCADE');
    await client.query(`
      CREATE TABLE vehicles (
        vehicle_id SERIAL PRIMARY KEY,
        model VARCHAR(100),
        type VARCHAR(50),
        registration_number VARCHAR(20) UNIQUE,
        transmission VARCHAR(10),
        year INTEGER,
        status VARCHAR(20) DEFAULT 'Available'
      )
    `);

    console.log("🌱 Seeding minimalist fleet (8 units)...");
    for (const v of vehicles) {
      await client.query(
        'INSERT INTO vehicles (model, type, registration_number, transmission, year, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [v.model, v.type, v.registration_number, v.transmission, v.year, v.status]
      );
    }
    await client.query('COMMIT');
    console.log("✅ Minimalist Fleet seeded successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Seeding failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
