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

// Initialize Socket.io
initSocket(server);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// quick test routes
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ mount routes
app.use("/auth", authenticationRoutes);
app.use("/admin", adminRoutes);
app.use("/instructor", instructorRoutes);
app.use("/notifications", notificationRoutes);
app.use("/gps", gpsRoutes);
app.use("/student", studentRoutes);
app.use("/trials", trialRoutes);

// Shared API routes for the entire system
const instructorController = require("./controllers/instructorController");
const vehicleController = require("./controllers/vehicleController");
const adminController = require("./controllers/adminController");
app.get("/api/materials", instructorController.getMaterials);
app.get("/api/vehicles", vehicleController.getAllVehicles);
app.get("/api/packages", adminController.getAdminPackages); // Alias for frontend compatibility

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🏁 GLOBAL ERROR HANDLER:", err);
  
  // Specific handling for Multer errors
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

// Handle Graceful Shutdown (Stops DB connection leaks on Ctrl+C)
let isShuttingDown = false;
const handleShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("🔄 Gracefully shutting down...");
  try {
    const pool = require("./config/db");
    // Only call end if it hasn't already been called
    if (pool && !pool.ended) {
      await pool.end(); // close all open connections
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
process.once("SIGUSR2", handleShutdown); // For nodemon restarts
