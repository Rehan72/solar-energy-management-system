/**
 * Solar Energy Management System - WebSocket Server
 * 
 * Real-time data broadcasting for live dashboard
 * 
 * Usage:
 *   node websocket-server.js
 *   
 * Runs on port 8081 by default
 */

const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.WS_PORT || 8081;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Solar WebSocket Server Running\n");
});

// Create Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Connected clients
const clients = new Set();

// Connection handler
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  clients.add(socket.id);

  // Send welcome message
  socket.emit("connected", {
    message: "Connected to Solar Energy WebSocket Server",
    clientId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    clients.delete(socket.id);
  });

  // Handle client subscription to specific devices/plants
  socket.on("subscribe", (data) => {
    console.log(`📡 Client ${socket.id} subscribed to:`, data);
    if (data.deviceId) {
      socket.join(`device:${data.deviceId}`);
    }
    if (data.plantId) {
      socket.join(`plant:${data.plantId}`);
    }
  });

  // Handle client unsubscription
  socket.on("unsubscribe", (data) => {
    console.log(`📡 Client ${socket.id} unsubscribed from:`, data);
    if (data.deviceId) {
      socket.leave(`device:${data.deviceId}`);
    }
    if (data.plantId) {
      socket.leave(`plant:${data.plantId}`);
    }
  });
});

// Broadcast functions
function broadcastSolarData(data) {
  const payload = {
    type: "solar-data",
    data: {
      deviceId: data.deviceId,
      solarPower: data.solarPower,
      loadPower: data.loadPower,
      batteryLevel: data.batteryLevel,
      gridPower: data.gridPower,
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: data.timestamp || new Date().toISOString()
    }
  };
  
  io.emit("solar-data", payload);
  console.log(`📊 Broadcast solar data: ${data.solarPower?.toFixed(2) || 0}W`);
}

function broadcastAlert(alert) {
  const payload = {
    type: "alert",
    data: {
      id: alert.id,
      severity: alert.severity,
      message: alert.message,
      deviceId: alert.deviceId,
      timestamp: alert.timestamp || new Date().toISOString()
    }
  };
  
  io.emit("alert", payload);
  console.log(`🚨 Broadcast alert: [${alert.severity}] ${alert.message}`);
}

function broadcastPrediction(prediction) {
  const payload = {
    type: "prediction",
    data: {
      predictedPower: prediction.predictedPower,
      confidence: prediction.confidence,
      timestamp: prediction.timestamp || new Date().toISOString()
    }
  };
  
  io.emit("prediction", payload);
  console.log(`🔮 Broadcast prediction: ${prediction.predictedPower}W`);
}

function broadcastAnomaly(data) {
  const payload = {
    type: "anomaly",
    data: {
      deviceId: data.deviceId,
      powerValue: data.powerValue,
      anomaly: data.anomaly,
      score: data.score,
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString()
    }
  };
  
  io.emit("anomaly", payload);
  console.log(`⚠️ Broadcast anomaly: ${data.message}`);
}

// Stats
function getStats() {
  return {
    connectedClients: clients.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

// Periodic stats broadcast (every 30 seconds)
setInterval(() => {
  io.emit("stats", getStats());
}, 30000);

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║     Solar Energy WebSocket Server                     ║
╠═══════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                      ║
║  📡 Waiting for client connections...                 ║
║  🔗 CORS enabled for all origins                      ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  io.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down...");
  process.exit(0);
});

// Export for use in other modules
module.exports = {
  io,
  broadcastSolarData,
  broadcastAlert,
  broadcastPrediction,
  broadcastAnomaly,
  getStats
};
