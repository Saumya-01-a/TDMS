const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const instructorController = require("../controllers/instructorController");
const upload = require("../config/multerConfig");

// Get all pending instructors
router.get("/pending-instructors", adminController.getPendingInstructors);

// Dashboard & Stats
router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/recent-activity", adminController.getRecentActivity);

// Financial Management
router.get("/financial-overview", adminController.getFinancialOverview);
router.get("/instructor-payout/:id", adminController.getInstructorPayoutDetails);
router.post("/record-payout", adminController.recordInstructorPayout);

// Approve or reject an instructor
router.post("/approve-instructor", adminController.approveInstructor);
router.get("/all-instructors", adminController.getAllInstructors);
router.post("/add-instructor", adminController.addInstructor);
router.put("/edit-instructor/:id", adminController.editInstructor);
router.delete("/delete-instructor/:id", adminController.deleteInstructor);

// --- Student Management ---
router.get("/all-students", adminController.getAllStudents);
router.post("/assign-instructor", adminController.assignInstructor);
router.post("/add-student", adminController.addStudent);
router.put("/edit-student/:id", adminController.editStudent);
router.delete("/delete-student/:id", adminController.deleteStudent);
router.patch("/update-progress/:id", adminController.updateStudentProgress);
router.patch("/complete-license/:id", adminController.completeLicense);
router.get("/export-students", adminController.exportStudents);
router.post("/sync-database", adminController.syncDatabaseStudents);

// --- Fleet Management ---
router.get("/all-vehicles", adminController.getAllVehicles);
router.post("/add-vehicle", adminController.addVehicle);
router.put("/edit-vehicle/:id", adminController.editVehicle);
router.delete("/delete-vehicle/:id", adminController.deleteVehicle);
router.post("/assign-vehicle-instructor", adminController.assignVehicleInstructor);
router.get("/vehicle-location/:id", adminController.getLatestVehicleLocation);

// --- Attendance Management ---
router.get("/attendance-logs", adminController.getAllAttendanceLogs);
router.get("/attendance-grid", adminController.getMonthlyAttendanceGrid);
router.get("/attendance-stats", adminController.getAttendanceStats);
router.post("/attendance-save", adminController.saveAttendance);
router.delete("/attendance-clear", adminController.clearAttendanceHistory);
router.delete("/bulk-cleanup", adminController.bulkCleanup);

// --- Vehicle Fleet Management ---
const vehicleController = require("../controllers/vehicleController");
router.patch("/vehicle-status/:id", vehicleController.updateVehicleStatus);

// --- Lesson Schedule Management ---
router.get("/schedule", adminController.getAllSchedules);
router.get("/schedule/form-data", adminController.getScheduleFormData);
router.post("/schedule", adminController.createLesson);
router.put("/schedule/:id", adminController.updateLesson);
router.delete("/schedule/:id", adminController.deleteLesson);

// --- Study Materials Management (Admin Only) ---
router.post("/materials/upload", upload.single("file"), instructorController.uploadMaterial);
router.delete("/materials/:id", instructorController.deleteMaterial);

// --- Package Management ---
router.get("/packages", adminController.getAdminPackages);
router.post("/packages", adminController.addPackage);
router.put("/packages/:id", adminController.editPackage);
router.delete("/packages/:id", adminController.deletePackage);

// --- Admin Personal Features ---
router.put("/profile/:userId", adminController.updateAdminProfile);
router.get("/payments", adminController.getAdminPayments);
router.post("/payments", adminController.recordStudentPayment);

module.exports = router;
