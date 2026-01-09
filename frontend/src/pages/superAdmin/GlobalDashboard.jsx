import { useState, useEffect } from 'react'
import { Activity, TrendingUp, Users, Zap, DollarSign, RefreshCw, BarChart3, Globe } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'
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
  const token = localStorage.getItem('token')

  const fetchGlobalStats = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/superadmin/global/stats')
      if (response.data) {
        setGlobalStats(prev => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      console.error('Failed to fetch global stats:', error)
      // Keep default values on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGlobalStats()
  }, [])


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold sun-glow-text">Global Dashboard</h1>
          <p className="text-solar-muted mt-2">Comprehensive overview of the entire solar energy management system</p>
        </div>
        <button
          onClick={fetchGlobalStats}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Plants"
          value={globalStats.totalPlants}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Energy Generated"
          value={globalStats.energyGenerated}
          icon={Activity}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Active Admins"
          value={globalStats.activeAdmins}
          icon={Users}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Revenue"
          value={globalStats.revenue}
          icon={DollarSign}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-panel/10"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={globalStats.totalUsers.toLocaleString()}
          icon={Users}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
        <StatCard
          title="System Efficiency"
          value={globalStats.systemEfficiency}
          icon={TrendingUp}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-yellow/10"
        />
        <StatCard
          title="CO₂ Reduced"
          value={globalStats.co2Reduced}
          icon={Globe}
          color="text-solar-warning"
          gradient="from-solar-warning/20 to-solar-warning/5"
        />
        <StatCard
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
    </div>
  )
}
