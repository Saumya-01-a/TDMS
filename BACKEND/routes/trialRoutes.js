const express = require("express");
const router = express.Router();
const trialController = require("../controllers/trialController");

// --- Trial Date Management (Admin) ---
router.post("/toggle", trialController.toggleTrialDate);
router.get("/dates", trialController.getTrialDates);

// --- Student Assignment (Admin) ---
router.get("/students/:trialId", trialController.getTrialStudents);
router.post("/assign", trialController.assignStudent);
router.delete("/remove/:assignmentId", trialController.removeStudent);

// --- Dashboard Stats ---
router.get("/stats", trialController.getTrialStats);

module.exports = router;
