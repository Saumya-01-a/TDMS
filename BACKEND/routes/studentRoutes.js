const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Get student dashboard overview
router.get("/dashboard/:userId", studentController.getStudentDashboardData);

// Trial Management (Admin View)
router.get("/all", studentController.getAllStudents);

module.exports = router;
