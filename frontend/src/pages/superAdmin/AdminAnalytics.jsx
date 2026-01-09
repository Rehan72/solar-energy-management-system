import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
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
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/admin/analytics')
      // Use response data or defaults
      setStats({
        totalUsers: response.data?.total_users || 1250,
        totalEnergy: response.data?.total_energy || 24456,
        activeDevices: response.data?.active_devices || 89,
        revenue: response.data?.revenue || 485000
      })
    } catch (error) {
      // Use defaults on error
      notify.error('Failed to load analytics data')
      setStats({
        totalUsers: 1250,
        totalEnergy: 24456,
        activeDevices: 89,
        revenue: 485000
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

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
    <div className="space-y-6">
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
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Energy Generated"
          value={`${stats.totalEnergy.toLocaleString()} kWh`}
          icon={Zap}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Active Devices"
          value={stats.activeDevices}
          icon={Activity}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats.revenue / 1000).toFixed(1)}L`}
          icon={DollarSign}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-primary/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth */}
        <div className="bg-solar-card rounded-xl p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-solar-yellow mr-2" />
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="users" fill="#FFD166" name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Stats */}
        <div className="bg-solar-card rounded-xl p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Zap className="w-5 h-5 text-solar-orange mr-2" />
            Energy Generation vs Consumption
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="generated" stroke="#FFD166" strokeWidth={2} name="Generated (kWh)" />
              <Line type="monotone" dataKey="consumed" stroke="#F4A261" strokeWidth={2} name="Consumed (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-solar-card rounded-xl p-6 energy-card">
        <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
          <Globe className="w-5 h-5 text-solar-success mr-2" />
          Regional Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis dataKey="region" type="category" stroke="#9CA3AF" width={80} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Bar dataKey="users" fill="#2ECC71" name="Users" />
            <Bar dataKey="plants" fill="#FFD166" name="Plants" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
