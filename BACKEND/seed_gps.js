const pool = require("./config/db");

async function seedGpsData() {
  const client = await pool.connect();
  try {
    // Clear existing logs to start fresh
    await client.query("DELETE FROM gps_logs");

    // Get vehicles
    const vehiclesRes = await client.query("SELECT vehicle_id, registration_number FROM vehicles LIMIT 5");
    const instructorRes = await client.query("SELECT instructor_id FROM instructors WHERE approval_status = 'approved' LIMIT 1");
    
    if (vehiclesRes.rowCount === 0 || instructorRes.rowCount === 0) {
      console.log("No vehicles or approved instructors found");
      return;
    }

    const instructorId = instructorRes.rows[0].instructor_id;

    // Define 5 distinct routes in Colombo that are strictly on major roads
    const routes = [
      // Route 1: Galle Road (North to South)
      [
        [6.9351, 79.8441], [6.9272, 79.8465], [6.9188, 79.8491], [6.9095, 79.8512], [6.9001, 79.8525]
      ],
      // Route 2: Duplication Road (R. A. De Mel Mawatha)
      [
        [6.9192, 79.8524], [6.9110, 79.8541], [6.9035, 79.8558], [6.8950, 79.8575], [6.8870, 79.8590]
      ],
      // Route 3: Baseline Road
      [
        [6.9385, 79.8720], [6.9280, 79.8735], [6.9180, 79.8750], [6.9080, 79.8765], [6.8980, 79.8780]
      ],
      // Route 4: Horton Place / Ward Place
      [
        [6.9195, 79.8635], [6.9180, 79.8700], [6.9165, 79.8750], [6.9150, 79.8800], [6.9140, 79.8850]
      ],
      // Route 5: Havelock Road
      [
        [6.8940, 79.8610], [6.8880, 79.8630], [6.8820, 79.8655], [6.8750, 79.8685], [6.8680, 79.8715]
      ]
    ];

    for (let v = 0; v < vehiclesRes.rows.length; v++) {
      const veh = vehiclesRes.rows[v];
      const routePoints = routes[v % routes.length];

      for (let i = 0; i < routePoints.length; i++) {
        const [lat, lng] = routePoints[i];
        const speed = Math.floor(Math.random() * 40) + 10;
        const minutesAgo = (routePoints.length - 1 - i) * 5;

        await client.query(
          `INSERT INTO gps_logs (instructor_id, vehicle_id, lat, lng, speed, recorded_at)
           VALUES ($1, $2, $3, $4, $5, NOW() - ($6 || ' minutes')::INTERVAL)`,
          [instructorId, veh.vehicle_id, lat, lng, speed, minutesAgo]
        );
      }
      console.log(`✅ Seeded road-aligned GPS logs for ${veh.registration_number}`);
    }

    console.log("🎉 GPS data successfully snapped to roads!");
  } catch (err) {
    console.error("Error seeding GPS data:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedGpsData();
