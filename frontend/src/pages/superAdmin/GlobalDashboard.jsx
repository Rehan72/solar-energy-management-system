import { useState, useEffect, useCallback } from 'react'
import { Activity, TrendingUp, Users, Zap, DollarSign, RefreshCw, BarChart3, Globe, MapPin, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import StatCard from '../../components/ui/stat-card'
import SolarMap from '../../components/SolarMap'
import { getRequest } from '../../lib/apiService'

export default function GlobalDashboard() {
  const [globalStats, setGlobalStats] = useState({
    totalPlants: 34,
    energyGenerated: '24.4 MWh',
    activeAdmins: 6,
    revenue: '₹4.8L',
    totalUsers: 1250,
    systemEfficiency: '94.2%',
    co2Reduced: '156.8 tons',
    uptime: '99.9%'
  })
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [period, setPeriod] = useState('month')
  const [trendData, setTrendData] = useState([])
  const [tickerEvents] = useState([
    { id: 1, text: "Plant Bangalore-Alpha efficiency reached 99.2%", type: "success" },
    { id: 2, text: "New commercial client onboarded in Mumbai region", type: "info" },
    { id: 3, text: "Main Grid load shifted to Solar Storage in Delhi-Central", type: "warning" },
    { id: 4, text: "Routine diagnostic sequence completed for Rajasthan-K1", type: "success" }
  ])

  const fetchGlobalStats = useCallback(async () => {
    try {
      setLoading(true)
      let url = `/superadmin/global/stats?period=${period}`
      if (selectedRegion) url += `&region=${selectedRegion}`
      const response = await getRequest(url)
      if (response.data && response.data.stats) {
        setGlobalStats(prev => ({ ...prev, ...response.data.stats }))
      }
    } catch (err) {
      console.error('Failed to fetch global stats:', err)
      // The original instruction seems to have provided a catch block from another file (EditRegion.jsx)
      // which included 'notify.error' and 'navigate'. These are not defined here.
      // To maintain syntactic correctness and avoid introducing undefined variables,
      // I am keeping the existing error handling for fetchGlobalStats.
      // If the intention was to add a notification system, 'notify' would need to be imported/defined.
      // If the intention was to navigate, 'navigate' would need to be imported from 'react-router-dom'.
      // console.error(err);
      // notify.error('Failed to fetch region') // Undefined 'notify'
      // navigate('/regions') // Undefined 'navigate'
    } finally {
      setLoading(false)
    }
  }, [period, selectedRegion])

  const fetchRegions = useCallback(async () => {
    try {
      const response = await getRequest('/superadmin/regions')
      if (response.data) {
        setRegions(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error)
    }
  }, [])

  const fetchTrendData = useCallback(async () => {
    try {
      let url = `/superadmin/energy/trend?period=${period}`
      if (selectedRegion) url += `&region=${selectedRegion}`
      const response = await getRequest(url)
      if (response.data && response.data.trend) {
        setTrendData(response.data.trend)
      }
    } catch (error) {
      console.error('Failed to fetch trend data:', error)
    }
  }, [period, selectedRegion])

  useEffect(() => {
    fetchRegions()
  }, [])

  useEffect(() => {
    fetchGlobalStats()
    fetchTrendData()
  }, [selectedRegion, period, fetchGlobalStats, fetchTrendData])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-solar-primary tracking-tight uppercase">Global Grid Intelligence</h1>
          <p className="text-solar-muted mt-2 font-medium italic">Autonomous ecosystem oversight and cross-regional telemetry analysis.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="solar-input min-w-[140px]"
          >
            <option value="week">Temporal: 7D</option>
            <option value="month">Temporal: 30D</option>
            <option value="quarter">Temporal: 90D</option>
            <option value="year">Temporal: 365D</option>
          </select>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="solar-input min-w-[160px]"
          >
            <option value="">Jurisdiction: Global</option>
            {regions.map(region => (
              <option key={region.id} value={region.name}>{region.name}</option>
            ))}
          </select>
          <button
            onClick={fetchGlobalStats}
            disabled={loading}
            className="sun-button px-6 py-2.5"
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Feed</span>
            </div>
          </button>
        </div>
      </div>

      {/* Live System Status Ticker */}
      <div className="solar-glass rounded-2xl p-3 relative overflow-hidden group border-solar-panel/20">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-solar-panel to-solar-yellow z-10"></div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 shrink-0 px-4 border-r border-solar-border/30">
            <div className="w-2 h-2 rounded-full bg-solar-success animate-ping"></div>
            <span className="text-[10px] font-black text-solar-primary uppercase tracking-widest">Spectral Telemetry</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex space-x-12 whitespace-nowrap"
            >
              {[...tickerEvents, ...tickerEvents].map((event, idx) => (
                <div key={`${event.id}-${idx}`} className="flex items-center space-x-3">
                  <span className="text-[10px] font-black text-solar-primary uppercase tracking-tight">{event.text}</span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-solar-night/50 text-solar-muted uppercase border border-solar-border/10 tracking-widest">SIGNAL_ACK</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          index={0}
          title="Total Plants"
          value={globalStats.totalPlants}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          index={1}
          title="Energy Generated"
          value={globalStats.energyGenerated}
          icon={Activity}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          index={2}
          title="Active Admins"
          value={globalStats.activeAdmins}
          icon={Users}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          index={3}
          title="Revenue"
          value={globalStats.revenue}
          icon={DollarSign}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-panel/10"
        />
      </div>

      {/* Energy Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="solar-glass rounded-3xl p-8 group relative overflow-hidden border-solar-panel/10"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-solar-primary flex items-center tracking-tight uppercase">
              <Zap className="w-6 h-6 mr-3 text-solar-yellow group-hover:scale-110 transition-transform" />
              Generation & Demand Matrix
            </h2>
            <p className="text-[10px] font-black text-solar-muted mt-1 uppercase tracking-[0.2em]">Aggregated System Performance Metrics</p>
          </div>
          <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-solar-muted">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm bg-solar-yellow/80"></div>
              <span>Solar Supply</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm bg-solar-orange/80"></div>
              <span>Load Demand</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="globalSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="globalLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4A261" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F4A261" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderRadius: '16px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="solar"
                stroke="#FFD166"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#globalSolar)"
                name="System Supply (kW)"
              />
              <Area
                type="monotone"
                dataKey="load"
                stroke="#F4A261"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#globalLoad)"
                name="Total Load (kW)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <SolarMap height="500px" selectedRegion={selectedRegion} />
      </motion.div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          index={4}
          title="Total Users"
          value={globalStats.totalUsers.toLocaleString()}
          icon={Users}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
        <StatCard
          index={5}
          title="System Efficiency"
          value={globalStats.systemEfficiency}
          icon={TrendingUp}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-yellow/10"
        />
        <StatCard
          index={6}
          title="CO₂ Reduced"
          value={globalStats.co2Reduced}
          icon={Globe}
          color="text-solar-warning"
          gradient="from-solar-warning/20 to-solar-warning/5"
        />
        <StatCard
          index={7}
          title="System Uptime"
          value={globalStats.uptime}
          icon={BarChart3}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
      </div>

      {/* System Overview */}

      {/* System Overview */}
      <div className="solar-glass rounded-3xl p-10 relative overflow-hidden border-solar-panel/20">
        <div className="absolute inset-0 bg-linear-to-br from-solar-panel/5 via-transparent to-solar-yellow/5 opacity-50"></div>
        <h2 className="text-3xl font-black text-solar-primary mb-12 text-center tracking-tighter uppercase relative z-10">Regional Fleet Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="text-center group">
            <div className="w-24 h-24 bg-linear-to-br from-solar-success/20 to-solar-success/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-500 border border-solar-success/20">
              <Activity className="w-12 h-12 text-solar-success" />
            </div>
            <h3 className="text-xl font-black text-solar-primary mb-3 uppercase tracking-tight">Grid Resilience</h3>
            <p className="text-sm font-medium text-solar-muted leading-relaxed italic">All system nodes operating at 99.9% uptime with autonomous self-healing protocols.</p>
          </div>
          <div className="text-center group">
            <div className="w-24 h-24 bg-linear-to-br from-solar-yellow/20 to-solar-orange/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-500 border border-solar-yellow/20">
              <TrendingUp className="w-12 h-12 text-solar-yellow" />
            </div>
            <h3 className="text-xl font-black text-solar-primary mb-3 uppercase tracking-tight">Spectral Yield</h3>
            <p className="text-sm font-medium text-solar-muted leading-relaxed italic">Harvesting energy at 94.2% efficiency threshold across the global decentralized fleet.</p>
          </div>
          <div className="text-center group">
            <div className="w-24 h-24 bg-linear-to-br from-solar-panel/20 to-solar-panel/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-500 border border-solar-panel/20">
              <Globe className="w-12 h-12 text-solar-panel" />
            </div>
            <h3 className="text-xl font-black text-solar-primary mb-3 uppercase tracking-tight">Eco-Sync Data</h3>
            <p className="text-sm font-medium text-solar-muted leading-relaxed italic">Aggregated carbon displacement of 156.8 tons verified by distributed ledger telemetry.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
