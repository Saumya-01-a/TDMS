/**
 * @file server.js
 * @description Main entry point for the Thisara Driving School Management System backend.
 * Responsible for initializing Express, middleware, database connections, socket.io, and route mounting.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const authenticationRoutes = require("./routes/authenticationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const instructorRoutes = require("./routes/instructorRoutes");

const http = require("http");
const { initSocket } = require("./socket");

const notificationRoutes = require("./routes/notificationRoutes");
const gpsRoutes = require("./routes/gpsRoutes");
const studentRoutes = require("./routes/studentRoutes");
const trialRoutes = require("./routes/trialRoutes");

const app = express();
const server = http.createServer(app);

/**
 * Socket.io Initialization
 * Enables real-time updates for financial data, student progress, and notifications.
 */
initSocket(server);

// Middleware Configuration
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * Health Check Route
 * Used by monitoring tools or Docker to verify the service is alive.
 */
app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * API Route Mounting
 * Organized by business entity to maintain modularity.
 */
app.use("/auth", authenticationRoutes);
app.use("/admin", adminRoutes);
app.use("/instructor", instructorRoutes);
app.use("/notifications", notificationRoutes);
app.use("/gps", gpsRoutes);
app.use("/student", studentRoutes);
app.use("/trials", trialRoutes);

/**
 * Shared/Aliased API Routes
 * These endpoints provide shared resources used across different organizational modules.
 */
const instructorController = require("./controllers/instructorController");
const vehicleController = require("./controllers/vehicleController");
const adminController = require("./controllers/adminController");
app.get("/api/materials", instructorController.getMaterials);
app.get("/api/vehicles", vehicleController.getAllVehicles);
app.get("/api/packages", adminController.getAdminPackages); // Alias for frontend compatibility

/**
 * Global Error Handler
 * Standardizes error responses across the entire application.
 * Specifically handles common issues like Multer file limit exceptions.
 */
app.use((err, req, res, next) => {
  console.error("[System Error] Global Exception Caught:", err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      ok: false,
      message: "File is too large! Maximum limit is 25MB."
    });
  }

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));

/**
 * Graceful Shutdown Logic
 * Prevents database connection leaks and ensuring clear process termination during updates or maintenance.
 */
let isShuttingDown = false;
const handleShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("🔄 Gracefully shutting down...");
  try {
    const pool = require("./config/db");
    if (pool && !pool.ended) {
      await pool.end();
      console.log("✅ Database pool closed");
    }
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
  }
  
  server.close(() => {
    console.log("✅ Server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
process.on("SIGUSR2", handleShutdown); // Support for nodemon auto-restarts

