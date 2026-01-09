import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, RefreshCw, BarChart3, Users, Activity, Settings, Shield, Globe, Zap } from 'lucide-react'
import StatCard from '../ui/stat-card'
import { getRequest } from '../../lib/apiService'
import LivePowerDashboard from './LivePowerDashboard'

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalPlants: 0,
    totalRegions: 0,
    systemStatus: 'Active'
  })
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const fetchStats = async () => {
    try {
      const [usersRes, adminsRes, plantsRes, regionsRes] = await Promise.all([
        getRequest('/superadmin/stats/users'),
        getRequest('/superadmin/stats/admins'),
        getRequest('/superadmin/stats/plants'),
        getRequest('/superadmin/stats/regions')
      ])

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalAdmins: adminsRes.data.total || 0,
        totalPlants: plantsRes.data.total || 0,
        totalRegions: regionsRes.data.total || 0,
        systemStatus: 'Active'
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchStats()
  }, [token, navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const refreshData = () => {
    fetchStats()
  }

  const quickActions = [
    { title: 'Manage Users', icon: Users, path: '/superadmin/users', color: 'text-solar-yellow' },
    { title: 'Manage Admins', icon: Shield, path: '/superadmin/admins', color: 'text-solar-orange' },
    { title: 'Manage Plants', icon: Zap, path: '/superadmin/plants', color: 'text-solar-success' },
    { title: 'Manage Regions', icon: Globe, path: '/superadmin/regions', color: 'text-solar-panel' },
    { title: 'All Devices', icon: Activity, path: '/superadmin/all-devices', color: 'text-solar-warning' },
    { title: 'Energy Analytics', icon: BarChart3, path: '/superadmin/all-energy', color: 'text-solar-primary' },
    { title: 'View Reports', icon: BarChart3, path: '/superadmin/reports', color: 'text-solar-muted' },
    { title: 'System Settings', icon: Settings, path: '/superadmin/settings', color: 'text-solar-muted' }
  ]

  return (
    <div className="min-h-screen bg-solar-bg">
      {/* Header */}
      <header className="bg-solar-card/80 backdrop-blur-md shadow-sm border-b border-solar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold sun-glow-text">Super Admin Dashboard</h1>
              <button
                onClick={refreshData}
                className="p-2 text-solar-muted hover:text-solar-yellow rounded-full hover:bg-solar-panel/20 transition sun-button"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-solar-muted">
                <User className="w-4 h-4" />
                <span>{user?.email || 'Super Admin'}</span>
                <span className="px-2 py-1 bg-solar-yellow text-solar-dark font-semibold rounded-full text-xs">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-solar-yellow hover:text-solar-yellow hover:bg-solar-panel/20 rounded-md transition sun-button"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Overview */}
        <div className="bg-solar-card rounded-lg shadow p-6 energy-card">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-solar-success" />
            <h2 className="text-xl font-semibold text-solar-primary">System Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="text-solar-yellow"
              gradient="from-solar-yellow/20 to-solar-orange/10"
            />
            <StatCard
              title="Regional Admins"
              value={stats.totalAdmins}
              icon={Shield}
              color="text-solar-orange"
              gradient="from-solar-orange/20 to-solar-orange/5"
            />
            <StatCard
              title="Solar Plants"
              value={stats.totalPlants}
              icon={Zap}
              color="text-solar-success"
              gradient="from-solar-success/20 to-solar-success/5"
            />
            <StatCard
              title="Regions"
              value={stats.totalRegions}
              icon={Globe}
              color="text-solar-panel"
              gradient="from-solar-panel/20 to-solar-panel/5"
            />
            <StatCard
              title="System Status"
              value={stats.systemStatus}
              icon={Activity}
              color="text-solar-success"
              gradient="from-solar-success/20 to-solar-success/5"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-solar-card rounded-lg shadow p-6 energy-card">
          <h2 className="text-xl font-semibold text-solar-primary mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-solar-night/80 rounded-lg p-4 energy-card hover:bg-solar-panel/20 transition sun-button text-left"
              >
                <div className="flex items-center space-x-3">
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                  <span className="text-solar-primary font-medium">{action.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Power Dashboard */}
        <div className="bg-solar-card rounded-lg shadow p-6 energy-card">
          <h2 className="text-xl font-semibold text-solar-primary mb-4">Live Power Monitoring</h2>
          <LivePowerDashboard />
        </div>

        {/* Recent Activity */}
        <div className="bg-solar-card rounded-lg shadow p-6 energy-card">
          <h2 className="text-xl font-semibold text-solar-primary mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-solar-night/80 rounded-lg">
              <div className="w-2 h-2 bg-solar-success rounded-full"></div>
              <span className="text-solar-muted">New user registered in Delhi region</span>
              <span className="text-xs text-solar-muted ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-solar-night/80 rounded-lg">
              <div className="w-2 h-2 bg-solar-yellow rounded-full"></div>
              <span className="text-solar-muted">Solar plant maintenance scheduled in Mumbai</span>
              <span className="text-xs text-solar-muted ml-auto">15 min ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-solar-night/80 rounded-lg">
              <div className="w-2 h-2 bg-solar-orange rounded-full"></div>
              <span className="text-solar-muted">Admin permissions updated for Patna region</span>
              <span className="text-xs text-solar-muted ml-auto">1 hour ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SuperAdminDashboard
