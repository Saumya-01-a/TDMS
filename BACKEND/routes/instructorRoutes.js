const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructorController");
const studentController = require("../controllers/studentController");
const upload = require("../config/multerConfig");

// Upload material
router.post("/upload", upload.single("material"), instructorController.uploadMaterial);

// Get all materials (for students/instructors)
router.get("/materials", instructorController.getMaterials);

// Dashboard routes
router.get("/stats/:instructorId", instructorController.getDashboardStats);
router.get("/schedule/:instructorId", instructorController.getWeeklySchedule);
router.patch("/availability/:instructorId", instructorController.updateAvailability);
router.get("/trial-candidates/:instructorId", studentController.getInstructorTrialCandidates);

// --- Student Management ---
router.get("/students/:instructorId", instructorController.getInstructorStudents);
router.get("/student-stats/:instructorId", instructorController.getInstructorStudentStats);
router.get("/packages", instructorController.getPackages);

// --- Attendance Management ---
router.get("/attendance/:instructorId/:year/:month", instructorController.getMonthlyAttendance);
router.post("/attendance/save", instructorController.saveAttendance);
router.get("/attendance-history/:instructorId", instructorController.getAttendanceHistory);
router.delete("/attendance-history/:instructorId", instructorController.clearAttendanceHistory);
router.get("/attendance-export/:instructorId/:year/:month", instructorController.exportAttendanceCSV);
router.get("/lessons/:instructorId", instructorController.getInstructorLessons);

// --- Profile & UI Refinement ---
router.get("/profile-minimal/:userId", instructorController.getInstructorMinimalProfile);
router.get("/profile-full/:userId", instructorController.getInstructorFullProfile);
router.patch("/profile-update/:userId", instructorController.updateInstructorProfile);
router.patch("/profile-image/:userId", upload.single("profileImage"), instructorController.updateInstructorProfileImage);

// --- Student context helper ---
router.get("/student-assigned-instructor/:studentUserId", instructorController.getStudentInstructor);

// --- Admin Audit ---
router.get("/all-full", instructorController.getAllInstructorsForAdmin);

module.exports = router;
