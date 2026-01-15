import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, RefreshCw, BarChart3, Users, Activity } from 'lucide-react'
import UserTable from '../common/UserTable'
import StatCard from '../ui/stat-card'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import LivePowerDashboard from './LivePowerDashboard'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const fetchUsers = async () => {
    try {
      const response = await getRequest('/admin/users')
      setUsers(response.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await getRequest('/admin/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(localStorage.getItem('user')))
    fetchUsers()
    fetchAnalytics()
  }, [token, navigate])

  const handleLogout = () => {
    notify.success('Logged out successfully');
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const refreshData = () => {
    fetchUsers()
    fetchAnalytics()
  }

  return (
    <div className="min-h-screen bg-solar-bg">
      {/* Header */}
      <header className="bg-solar-card/80 backdrop-blur-md shadow-sm border-b border-solar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold sun-glow-text">Admin Dashboard</h1>
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
                <span>{user?.email || 'Admin'}</span>
                <span className="px-2 py-1 bg-solar-yellow text-solar-dark font-semibold rounded-full text-xs">
                  {user?.role || 'ADMIN'}
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
        {/* Analytics Section */}
        <div className="solar-glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-solar-success" />
            <h3 className="text-lg font-semibold text-solar-primary">System Analytics</h3>
          </div>
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Users"
                value={analytics.stats?.total_users || 0}
                icon={Users}
                color="text-solar-success"
                gradient="from-solar-success/20 to-solar-success/5"
              />
              <StatCard
                title="Energy Generated"
                value={analytics.stats?.energy_generated || '0 kWh'}
                icon={Activity}
                color="text-solar-success"
                gradient="from-solar-success/20 to-solar-success/5"
              />
              <StatCard
                title="Revenue (Est.)"
                value={analytics.stats?.revenue || '₹0'}
                icon={BarChart3}
                color="text-solar-yellow"
                gradient="from-solar-yellow/20 to-solar-orange/10"
              />
            </div>
          ) : (
            <p className="text-solar-muted">Loading analytics...</p>
          )}
        </div>

        {/* Live Power Dashboard */}
        <div className="solar-glass rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-solar-primary mb-4">Live Power Monitoring</h3>
          <LivePowerDashboard />
        </div>

        {/* User Management Section */}
        <UserTable
          users={users}
          onUserChange={fetchUsers}
          currentUserRole={user?.role}
          endpoint="/admin/users"
        />
      </main>
    </div>
  )
}

export default AdminDashboard