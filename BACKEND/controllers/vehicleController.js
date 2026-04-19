const pool = require('../config/db');
const { broadcastVehicleStatusUpdate } = require('../socket');

// Fetch all vehicles
exports.getAllVehicles = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM public.vehicles ORDER BY vehicle_id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Update vehicle status (Admin endpoint)
exports.updateVehicleStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'Available' or 'In Use'

  try {
    const result = await pool.query(
      'UPDATE public.vehicles SET status = $1 WHERE vehicle_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const updatedVehicle = result.rows[0];

    // Emit real-time update via Socket.io
    broadcastVehicleStatusUpdate(id, status);

    res.status(200).json({
      message: `Vehicle status updated to ${status}`,
      vehicle: updatedVehicle
    });
  } catch (err) {
    next(err);
  }
};
