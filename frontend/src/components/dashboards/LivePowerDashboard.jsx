/**
 * Live Power Dashboard Component
 * Real-time solar power monitoring using WebSocket
 */

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Zap, Battery, TrendingUp, Thermometer, Droplets, Info, AlertTriangle, Activity } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-3 ${connected ? "bg-solar-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-solar-danger"
              }`}
          />
          <span className="text-sm font-medium text-solar-muted">
            {connected ? "Live System Feedback Connected" : "Attempting to sync with hardware..."}
          </span>
        </div>
        {connected && (
          <div className="text-[10px] font-bold text-solar-success bg-solar-success/10 px-2 py-0.5 rounded uppercase tracking-tighter">
            Real-time
          </div>
        )}
      </div>

      {/* Main Power Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PowerCard
          index={0}
          title="Solar Generation"
          value={power}
          unit="W"
          icon={<Sun className="w-6 h-6" />}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <PowerCard
          index={1}
          title="Household Load"
          value={load}
          unit="W"
          icon={<Zap className="w-6 h-6" />}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <PowerCard
          index={2}
          title="Battery Storage"
          value={battery}
          unit="%"
          icon={<Battery className="w-6 h-6" />}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <PowerCard
          index={3}
          title="Grid Status"
          value={grid}
          unit="W"
          icon={<Activity className="w-6 h-6" />}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          index={4}
          title="Ambient Temp"
          value={temperature.toFixed(1)}
          unit="°C"
          icon={<Thermometer className="w-5 h-5" />}
          color="text-solar-orange"
        />
        <MetricCard
          index={5}
          title="Humidity Level"
          value={humidity.toFixed(1)}
          unit="%"
          icon={<Droplets className="w-5 h-5" />}
          color="text-solar-panel"
        />
        <MetricCard
          index={6}
          title="System Efficiency"
          value={efficiency}
          unit="%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-solar-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Predictions */}
        {predictions && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-glass-light rounded-2xl p-6 border border-solar-border/30 shadow-xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <h2 className="text-xl font-bold mb-4 flex items-center text-solar-primary">
              <span className="mr-3 p-2 bg-solar-yellow/20 rounded-lg"><Activity className="text-solar-yellow" size={20} /></span>
              AI Predictions
            </h2>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-black text-solar-yellow">
                {predictions.predictedPower?.toFixed(2) || 0}W
              </span>
              <span className="text-sm font-semibold text-solar-muted px-2 py-1 bg-solar-card rounded-md border border-solar-border/30">
                {(predictions.confidence * 100).toFixed(0)}% accuracy
              </span>
            </div>
            <p className="mt-4 text-xs text-solar-muted font-medium italic">Based on real-time neural processing of local environmental data.</p>
          </motion.div>
        )}

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-glass-light rounded-2xl p-6 border border-solar-border/30 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center text-solar-primary">
            <span className="mr-3 p-2 bg-solar-orange/20 rounded-lg"><AlertTriangle className="text-solar-orange" size={20} /></span>
            System Health Monitoring
          </h2>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-solar-muted opacity-50">
              <Info size={32} className="mb-2" />
              <p className="text-sm font-medium">All systems normal</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, height: 0, margin: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-xl bg-solar-card border border-solar-border/30 group hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 p-1.5 rounded-md ${alert.severity === 'CRITICAL' ? 'bg-solar-danger/20 text-solar-danger' :
                            alert.severity === 'WARN' ? 'bg-solar-warning/20 text-solar-warning' : 'bg-solar-panel/20 text-solar-panel'
                          }`}>
                          <AlertTriangle size={14} />
                        </div>
                        <div>
                          <span className={`font-bold uppercase text-[10px] tracking-widest ${alert.severity === 'CRITICAL' ? 'text-solar-danger' :
                              alert.severity === 'WARN' ? 'text-solar-warning' : 'text-solar-panel'
                            }`}>
                            {alert.severity}
                          </span>
                          <p className="text-sm font-semibold text-solar-primary mt-0.5 leading-snug">{alert.message}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-solar-muted opacity-50">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Power Card Component
function PowerCard({ index, title, value, unit, icon, color, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-glass-light rounded-2xl p-6 border border-solar-border/30 shadow-xl group overflow-hidden relative"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-inner group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
          <span className={color}>{icon}</span>
        </div>
        <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest opacity-60">{title}</span>
      </div>
      <div className={`text-4xl font-black ${color} relative z-10 flex items-baseline`}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        <span className="text-sm font-bold ml-1 opacity-50">{unit}</span>
      </div>
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-20 transition-opacity duration-500 rounded-full blur-2xl`}></div>
    </motion.div>
  );
}

// Metric Card Component
function MetricCard({ index, title, value, unit, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-glass-light rounded-xl p-4 border border-solar-border/30 shadow-md flex items-center space-x-4 hover:shadow-lg transition-all duration-300"
    >
      <div className={`p-2 rounded-lg bg-solar-card border border-solar-border/30 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-solar-muted uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-bold text-solar-primary">{value}</span>
          <span className="text-xs font-semibold text-solar-muted">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
}
