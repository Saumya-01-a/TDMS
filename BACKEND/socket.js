const { Server } = require("socket.io");
const gpsController = require("./controllers/gpsController");

let io;
const userSockets = new Map(); // Map instructorId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on("connection", (socket) => {
    console.log("🔌 New socket connection:", socket.id);

    socket.on("register", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined room ${userId}`);
      }
    });

    // 📍 Real-time GPS Tracking
    socket.on("update_location", async (data) => {
      // data: { vehicleId, lat, lng, instructorId, speed }
      socket.to("vehicle_tracking").emit("location_update", data);
      
      // Throttled Database Logging (Approx. once per 5 seconds)
      // For simplicity in this demo, we'll log every coordinate, but it could be throttled.
      await gpsController.logCoordinate(data);
      
      console.log(`📡 Location for ${data.vehicleId} moved to ${data.lat}, ${data.lng}`);
    });

    // 🚗 Join Tracking Room (Students)
    socket.on("join_tracking", () => {
      socket.join("vehicle_tracking");
      console.log(`🚗 Socket ${socket.id} joined tracking room`);
    });

    socket.on("disconnect", () => {
      console.log(`👋 Socket ${socket.id} disconnected`);
    });
  });

  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(userId).emit("new_notification", notification);
    console.log(`📩 Notification emitted to room ${userId}`);
  }
};

const broadcastVehicleStatusUpdate = (vehicleId, status) => {
  if (io) {
    io.emit("vehicle_status_updated", { vehicleId, status });
    console.log(`📡 Broadcasted vehicle status update: ${vehicleId} -> ${status}`);
  }
};

const broadcastInstructorStatus = (instructorId, status) => {
  if (io) {
    io.emit("instructor_status_updated", { instructorId, status });
    console.log(`📡 Broadcasted instructor status update: ${instructorId} -> ${status}`);
  }
};

const broadcastFinancialUpdate = () => {
  if (io) {
    io.emit("financial_update");
    console.log(`📡 Broadcasted global financial data update`);
  }
};

const broadcastTrialUpdate = (data) => {
  if (io) {
    io.emit("trial_update", data);
    console.log(`📡 Broadcasted trial update:`, data);
  }
};

const broadcastPackageUpdate = () => {
  if (io) {
    io.emit("package_update");
    console.log(`📡 Broadcasted package update event`);
  }
};

const broadcastStudentUpdate = () => {
  if (io) {
    io.emit("student_update");
    console.log(`📡 Broadcasted global student data update`);
  }
};

module.exports = { 
  initSocket, 
  sendNotificationToUser, 
  broadcastVehicleStatusUpdate,
  broadcastInstructorStatus,
  broadcastTrialUpdate,
  broadcastFinancialUpdate,
  broadcastPackageUpdate,
  broadcastStudentUpdate
};
