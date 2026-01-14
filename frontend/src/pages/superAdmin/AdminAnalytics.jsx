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
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Fleet Intelligence Hub</h1>
          <p className="text-solar-muted mt-1 font-medium italic">Advanced performance analytics and regional growth telemetry.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="solar-input min-w-[140px]"
          >
            <option value="week">Temporal: 7D</option>
            <option value="month">Temporal: 30D</option>
            <option value="quarter">Temporal: 90D</option>
          </select>
          <button
            onClick={fetchStats}
            className="sun-button px-6 py-2.5"
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Flux</span>
            </div>
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
          className="solar-glass rounded-3xl p-8 group border-solar-panel/10"
        >
          <h3 className="text-xl font-black text-solar-primary mb-8 flex items-center uppercase tracking-tight">
            <TrendingUp className="w-5 h-5 text-solar-yellow mr-3 group-hover:scale-110 transition-transform" />
            Adoption Matrix
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }} />
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
              <Area type="monotone" dataKey="users" stroke="#FFD166" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Energy Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="solar-glass rounded-3xl p-8 group border-solar-panel/10"
        >
          <h3 className="text-xl font-black text-solar-primary mb-8 flex items-center uppercase tracking-tight">
            <Zap className="w-5 h-5 text-solar-yellow mr-3 group-hover:scale-110 transition-transform" />
            Photon Exchange yield
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }} />
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
        className="solar-glass rounded-3xl p-8 group border-solar-panel/10"
      >
        <h3 className="text-xl font-black text-solar-primary mb-8 flex items-center uppercase tracking-tight">
          <Globe className="w-5 h-5 text-solar-success mr-3 group-hover:rotate-12 transition-transform" />
          Territorial Jurisdiction balance
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={regionalData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }} />
            <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11, fontWeight: 700 }} width={120} />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ fontSize: '11px', fontWeight: '600' }}
            />
            <Bar dataKey="users" fill="#10B981" radius={[0, 8, 8, 0]} name="PersonnelCount" barSize={16} />
            <Bar dataKey="plants" fill="#FFD166" radius={[0, 8, 8, 0]} name="AssetDensity" barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}
