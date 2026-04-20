const express = require("express");
const router = express.Router();
const authenticationController = require("../controllers/authenticationController");
const upload = require("../config/multerConfig");

// Student/Register (also for instructors)
router.post("/register", upload.single("verificationDoc"), authenticationController.register);

// Student/Login
router.post("/login", authenticationController.login);

// Email Verification
router.get("/verify-email/:token", authenticationController.verifyEmail);

// Passwords & Profile
router.post("/forgot-password", authenticationController.forgotPassword);
router.get("/profile/:userId", authenticationController.getUserProfile);

module.exports = router;
