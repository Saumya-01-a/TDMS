const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Get student dashboard overview
router.get("/dashboard/:userId", studentController.getStudentDashboardData);

// Trial Management (Admin View)
router.get("/all", studentController.getAllStudents);

// Full Schedule
router.get("/full-schedule/:userId", studentController.getStudentFullSchedule);

// Packages Management
router.get("/packages", studentController.getPackages);
router.post("/select-package", studentController.selectPackage);

// Payment & Profile Sync
router.get("/payments/:userId", studentController.getStudentPayments);
router.get("/profile/:userId", studentController.getStudentProfile);
router.put("/profile/update/:userId", studentController.updateStudentProfile);

module.exports = router;
