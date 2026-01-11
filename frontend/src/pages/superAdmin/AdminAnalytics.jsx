import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { motion } from 'framer-motion'
import { Users, Zap, TrendingUp, DollarSign, Activity, BarChart3, RefreshCw, Globe } from 'lucide-react'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import StatCard from '../../components/ui/stat-card'

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEnergy: 0,
    activeDevices: 0,
    revenue: 0
  })
  const [regionalData, setRegionalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await getRequest(`/admin/analytics?period=${period}`)

      setStats({
        totalUsers: response.data?.stats?.total_users || 0,
        totalEnergy: response.data?.stats?.total_energy || 0,
        activeDevices: response.data?.stats?.active_devices || 0,
        revenue: response.data?.stats?.revenue_raw || 0
      })
    } catch (error) {
      notify.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRegionalStats = async () => {
    try {
      const response = await getRequest('/superadmin/stats/regional')
      if (response.data && response.data.data) {
        setRegionalData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch regional stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRegionalStats()
  }, [period])

  // Sample chart data
  const userGrowthData = [
    { month: 'Jan', users: 450 },
    { month: 'Feb', users: 520 },
    { month: 'Mar', users: 610 },
    { month: 'Apr', users: 780 },
    { month: 'May', users: 920 },
    { month: 'Jun', users: 1100 },
    { month: 'Jul', users: 1250 },
  ]

  const energyData = [
    { day: 'Mon', generated: 22.5, consumed: 18.2 },
    { day: 'Tue', generated: 24.1, consumed: 19.5 },
    { day: 'Wed', generated: 21.8, consumed: 17.9 },
    { day: 'Thu', generated: 25.2, consumed: 20.1 },
    { day: 'Fri', generated: 23.7, consumed: 18.8 },
    { day: 'Sat', generated: 26.1, consumed: 16.5 },
    { day: 'Sun', generated: 24.8, consumed: 15.2 },
  ]

  const regionData = [
    { region: 'North', users: 320, plants: 45 },
    { region: 'South', users: 280, plants: 38 },
    { region: 'East', users: 250, plants: 32 },
    { region: 'West', users: 220, plants: 28 },
    { region: 'Central', users: 180, plants: 22 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Admin Analytics</h1>
          <p className="text-solar-muted mt-1">Platform performance and user metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 bg-solar-card text-solar-primary border border-solar-border rounded-lg px-3"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          <button
            onClick={fetchStats}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          index={0}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          index={1}
          title="Energy Generated"
          value={`${stats.totalEnergy.toLocaleString()} kWh`}
          icon={Zap}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          index={2}
          title="Active Devices"
          value={stats.activeDevices}
          icon={Activity}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          index={3}
          title="Revenue"
          value={`₹${(stats.revenue / 100000).toFixed(2)}L`}
          icon={DollarSign}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-primary/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-solar-card/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 energy-card border border-solar-border/30"
        >
          <h3 className="text-lg font-bold text-solar-primary mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 text-solar-yellow mr-2" />
            Platform Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Energy Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-solar-card/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 energy-card border border-solar-border/30"
        >
          <h3 className="text-lg font-bold text-solar-primary mb-6 flex items-center">
            <Zap className="w-5 h-5 text-solar-orange mr-2" />
            Energy Analytics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={energyData}>
              <defs>
                <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="generated" stroke="#FFD166" strokeWidth={3} fillOpacity={1} fill="url(#colorGenerated)" name="Generated (kWh)" />
              <Area type="monotone" dataKey="consumed" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorConsumed)" name="Consumed (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Regional Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-solar-card/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 energy-card border border-solar-border/30"
      >
        <h3 className="text-lg font-bold text-solar-primary mb-6 flex items-center">
          <Globe className="w-5 h-5 text-solar-success mr-2" />
          Regional Distribution Metrics
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={regionalData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={120} />
            <Tooltip
              cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="users" fill="#10B981" radius={[0, 4, 4, 0]} name="Users" barSize={20} />
            <Bar dataKey="plants" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Plants" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}
