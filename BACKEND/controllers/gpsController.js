const pool = require('../config/db');

/**
 * Save a new pre-defined route for an instructor and vehicle
 */
exports.saveRoute = async (req, res) => {
  const { instructorId, vehicleId, routeName, routePoints } = req.body;

  try {
    await pool.query(
      "UPDATE gps_routes SET is_active = false WHERE vehicle_id = $1",
      [vehicleId]
    );

    const result = await pool.query(
      `INSERT INTO gps_routes (instructor_id, vehicle_id, route_name, route_points, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [instructorId, vehicleId, routeName, JSON.stringify(routePoints)]
    );

    res.status(201).json({ ok: true, route: result.rows[0] });
  } catch (err) {
    console.error("Save Route Error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Get the active route for a vehicle (Student View)
 */
exports.getActiveRoute = async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM gps_routes WHERE vehicle_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1",
      [vehicleId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "No active route found" });
    }
    
    res.json({ ok: true, route: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * --- REAL-TIME FLEET STATUS (ADMIN) ---
 */
exports.getLiveStatus = async (req, res) => {
  try {
    // Get the most recent log for every vehicle seen in the last 10 minutes
    const result = await pool.query(`
      SELECT DISTINCT ON (gps_logs.vehicle_id) 
        gps_logs.vehicle_id, 
        v.registration_number, 
        v.type,
        gps_logs.lat, 
        gps_logs.lng, 
        gps_logs.speed, 
        gps_logs.recorded_at,
        CASE WHEN gps_logs.recorded_at > NOW() - INTERVAL '5 minutes' THEN true ELSE false END as is_active,
        u.first_name || ' ' || u.last_name as instructor_name
      FROM gps_logs
      LEFT JOIN vehicles v ON gps_logs.vehicle_id::TEXT = v.vehicle_id::TEXT
      LEFT JOIN instructors i ON gps_logs.instructor_id::TEXT = i.instructor_id::TEXT
      LEFT JOIN users u ON i.user_id::TEXT = u.user_id::TEXT
      ORDER BY gps_logs.vehicle_id, gps_logs.recorded_at DESC
    `);
    
    res.json({ ok: true, vehicles: result.rows });
  } catch (err) {
    console.error("Live Status Error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * --- HISTORICAL ROUTE ANALYSIS ---
 */
exports.getRouteHistory = async (req, res) => {
  const { vehicleId } = req.params;
  const { date } = req.query; // Expects YYYY-MM-DD
  
  try {
    const query = date 
      ? ["SELECT * FROM gps_logs WHERE vehicle_id::TEXT = $1::TEXT AND recorded_at::date = $2 ORDER BY recorded_at ASC", [vehicleId, date]]
      : ["SELECT * FROM gps_logs WHERE vehicle_id::TEXT = $1::TEXT AND recorded_at > NOW() - INTERVAL '24 hours' ORDER BY recorded_at ASC", [vehicleId]];

    const result = await pool.query(query[0], query[1]);
    
    // Group logs into "sessions" by finding gaps > 5 minutes
    const sessions = [];
    let currentSession = null;
    
    result.rows.forEach((log, idx) => {
      if (!currentSession || (new Date(log.recorded_at) - new Date(result.rows[idx-1].recorded_at)) > 300000) {
        currentSession = {
          session_id: `trip_${log.recorded_at.getTime()}`,
          start_time: log.recorded_at,
          end_time: log.recorded_at,
          points: [[log.lat, log.lng]],
          logs: [log]
        };
        sessions.push(currentSession);
      } else {
        currentSession.points.push([log.lat, log.lng]);
        currentSession.logs.push(log);
        currentSession.end_time = log.recorded_at;
      }
    });

    res.json({ ok: true, sessions });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Clear GPS coordinate logs for an instructor
 */
exports.clearGpsHistory = async (req, res) => {
  const { instructorId } = req.params;
  try {
    await pool.query("DELETE FROM gps_logs WHERE instructor_id = $1", [instructorId]);
    res.json({ ok: true, message: "GPS history cleared successfully." });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * Log coordinate (Internal use by socket or direct API)
 */
exports.logCoordinate = async (data) => {
  const { instructorId, vehicleId, lat, lng, speed } = data;
  try {
    await pool.query(
      "INSERT INTO gps_logs (instructor_id, vehicle_id, lat, lng, speed) VALUES ($1::TEXT, $2::TEXT, $3, $4, $5)",
      [instructorId, vehicleId, lat, lng, speed]
    );
  } catch (err) {
    console.error("Coordinate Logging Error:", err);
  }
};
