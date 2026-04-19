const express = require("express");
const router = express.Router();
const gpsController = require("../controllers/gpsController");

// --- Route Planning ---
router.post("/save-route", gpsController.saveRoute);
router.get("/active-route/:vehicleId", gpsController.getActiveRoute);

// --- History & Live Management ---
router.get("/live", gpsController.getLiveStatus);
router.get("/history/:vehicleId", gpsController.getRouteHistory);
router.delete("/clear-history/:instructorId", gpsController.clearGpsHistory);

module.exports = router;
