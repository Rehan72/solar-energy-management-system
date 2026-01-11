import { useState, useEffect } from 'react'
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
  const token = localStorage.getItem('token')

  const fetchGlobalStats = async () => {
    try {
      setLoading(true)
      let url = `/superadmin/global/stats?period=${period}`
      if (selectedRegion) url += `&region=${selectedRegion}`
      const response = await getRequest(url)
      if (response.data && response.data.stats) {
        setGlobalStats(prev => ({ ...prev, ...response.data.stats }))
      }
    } catch (error) {
      console.error('Failed to fetch global stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegions = async () => {
    try {
      const response = await getRequest('/superadmin/regions')
      if (response.data) {
        setRegions(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error)
    }
  }

  const fetchTrendData = async () => {
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
  }

  useEffect(() => {
    fetchRegions()
  }, [])

  useEffect(() => {
    fetchGlobalStats()
    fetchTrendData()
  }, [selectedRegion, period])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold sun-glow-text">Global Dashboard</h1>
          <p className="text-solar-muted mt-2">Comprehensive overview of the entire solar energy management system</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 bg-solar-card border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:ring-2 focus:ring-solar-yellow/50 transition-all font-medium"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 bg-solar-card border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:ring-2 focus:ring-solar-yellow/50 transition-all font-medium"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region.id} value={region.name}>{region.name}</option>
            ))}
          </select>
          <button
            onClick={fetchGlobalStats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live System Status Ticker */}
      <div className="glass-card rounded-xl p-3 mb-6 relative overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1 vibrancy z-10"></div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 flex-shrink-0 px-4 border-r border-solar-border/30">
            <div className="w-2 h-2 rounded-full bg-solar-success animate-ping"></div>
            <span className="text-[10px] font-black text-solar-primary uppercase tracking-widest">Live Node Status</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex space-x-12 whitespace-nowrap"
            >
              {[...tickerEvents, ...tickerEvents].map((event, idx) => (
                <div key={`${event.id}-${idx}`} className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-solar-primary opacity-80">{event.text}</span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-solar-night/50 text-solar-muted uppercase border border-solar-border/10">TELEMETRY_SYNC</span>
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
        className="bg-solar-card/50 backdrop-blur-md rounded-2xl shadow-xl p-8 energy-card border border-solar-border/30"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold sun-glow-text flex items-center">
              <Zap className="w-5 h-5 mr-3 text-solar-yellow" />
              Generation & Demand Analytics
            </h2>
            <p className="text-xs text-solar-muted mt-1">Aggregated energy metrics across all selected regions</p>
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

      <div className="bg-gradient-to-br from-solar-card to-solar-night/30 rounded-xl p-8 energy-card border border-solar-border/50 shadow-xl">
        <h2 className="text-2xl font-bold sun-glow-text mb-6 text-center">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-solar-success/30 to-solar-success/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Activity className="w-10 h-10 text-solar-success drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-bold text-solar-primary mb-3 group-hover:text-solar-success transition-colors duration-300">Operational Status</h3>
            <p className="text-solar-muted leading-relaxed">All systems running optimally with 99.9% uptime across all regions</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-solar-yellow/30 to-solar-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <TrendingUp className="w-10 h-10 text-solar-yellow drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-bold text-solar-primary mb-3 group-hover:text-solar-yellow transition-colors duration-300">Performance</h3>
            <p className="text-solar-muted leading-relaxed">Average system efficiency at 94.2% across all solar plants</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-solar-panel/30 to-solar-panel/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Globe className="w-10 h-10 text-solar-panel drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-bold text-solar-primary mb-3 group-hover:text-solar-panel transition-colors duration-300">Environmental Impact</h3>
            <p className="text-solar-muted leading-relaxed">156.8 tons of CO₂ reduced this month through clean energy</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
