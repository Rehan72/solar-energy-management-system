/**
 * Live Power Dashboard Component
 * Real-time solar power monitoring using WebSocket
 */

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:8081";

export default function LivePowerDashboard() {
  const [power, setPower] = useState(0);
  const [load, setLoad] = useState(0);
  const [battery, setBattery] = useState(0);
  const [grid, setGrid] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState(null);

  // Connect to WebSocket
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
      setConnected(false);
    });

    socket.on("connected", (data) => {
      console.log("Received connection confirmation:", data);
    });

    // Listen for solar data updates
    socket.on("solar-data", (data) => {
      console.log("📊 Received solar data:", data);
      if (data.data) {
        setPower(data.data.solarPower || 0);
        setLoad(data.data.loadPower || 0);
        setBattery(data.data.batteryLevel || 0);
        setGrid(data.data.gridPower || 0);
        setTemperature(data.data.temperature || 0);
        setHumidity(data.data.humidity || 0);
      }
    });

    // Listen for alerts
    socket.on("alert", (data) => {
      console.log("🚨 Received alert:", data);
      const newAlert = {
        id: data.data.id,
        severity: data.data.severity,
        message: data.data.message,
        timestamp: data.data.timestamp,
      };
      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });

    // Listen for predictions
    socket.on("prediction", (data) => {
      console.log("🔮 Received prediction:", data);
      setPredictions(data.data);
    });

    // Listen for anomaly detection
    socket.on("anomaly", (data) => {
      console.log("⚠️ Received anomaly:", data);
      const anomalyAlert = {
        id: `anomaly-${Date.now()}`,
        severity: "WARN",
        message: data.data.message,
        timestamp: data.data.timestamp,
      };
      setAlerts((prev) => [anomalyAlert, ...prev.slice(0, 9)]);
    });

    // Listen for stats
    socket.on("stats", (data) => {
      console.log("📈 Server stats:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Calculate efficiency
  const efficiency = power > 0 ? ((power / 5000) * 100).toFixed(1) : 0; // Assuming 5kW max

  // Get alert color
  const getAlertColor = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-500";
      case "WARN":
        return "text-yellow-500";
      case "INFO":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        ☀️ Live Solar Dashboard
      </h1>

      {/* Connection Status */}
      <div className="mb-4 flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            connected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-gray-400">
          {connected ? "Connected to real-time server" : "Connecting..."}
        </span>
      </div>

      {/* Main Power Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PowerCard
          title="Solar Power"
          value={power}
          unit="W"
          icon="☀️"
          color="text-yellow-400"
          bg="bg-yellow-400/10"
        />
        <PowerCard
          title="Load"
          value={load}
          unit="W"
          icon="🏠"
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        <PowerCard
          title="Battery"
          value={battery}
          unit="%"
          icon="🔋"
          color="text-green-400"
          bg="bg-green-400/10"
        />
        <PowerCard
          title="Grid"
          value={grid}
          unit="W"
          icon="⚡"
          color="text-purple-400"
          bg="bg-purple-400/10"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Temperature"
          value={temperature.toFixed(1)}
          unit="°C"
          icon="🌡️"
        />
        <MetricCard
          title="Humidity"
          value={humidity.toFixed(1)}
          unit="%"
          icon="💧"
        />
        <MetricCard
          title="Efficiency"
          value={efficiency}
          unit="%"
          icon="📊"
        />
      </div>

      {/* Predictions */}
      {predictions && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <span className="mr-2">🔮</span> AI Prediction
          </h2>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-yellow-400">
              {predictions.predictedPower?.toFixed(2) || 0}W
            </span>
            <span className="ml-2 text-sm text-gray-400">
              ({(predictions.confidence * 100).toFixed(0)}% confidence)
            </span>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🚨</span> Recent Alerts
        </h2>
        {alerts.length === 0 ? (
          <p className="text-gray-400">No alerts</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg bg-gray-700 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold uppercase text-xs">
                      [{alert.severity}]
                    </span>
                    <p className="mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Power Card Component
function PowerCard({ title, value, unit, icon, color, bg }) {
  return (
    <div className={`rounded-lg p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className={`text-3xl font-bold ${color}`}>
        {value.toFixed(2)}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, unit, icon }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {value}
        <span className="text-sm font-normal ml-1 text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
