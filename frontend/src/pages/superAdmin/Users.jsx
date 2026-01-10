import { useState, useEffect } from 'react'
import { Users as UsersIcon, UserPlus, Search, Filter, RefreshCw, Eye, Edit, User, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/stat-card'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/superadmin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      notify.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'USER': return 'bg-solar-success text-white'
      case 'ADMIN': return 'bg-solar-orange text-white'
      case 'SUPER_ADMIN': return 'bg-solar-danger text-white'
      default: return 'bg-solar-muted text-solar-primary'
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-solar-bg/80 z-50 flex flex-col items-center justify-center">
          <SunLoader message="Loading users..." size="large" />
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">User Management</h1>
          <p className="text-solar-muted mt-1">Manage all users across the platform</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/users/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.filter(u => u.role === 'USER').length}
          icon={UsersIcon}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Total Admins"
          value={users.filter(u => u.role === 'ADMIN').length}
          icon={UsersIcon}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Active Users"
          value={users.filter(u => u.is_active && u.role === 'USER').length}
          icon={UsersIcon}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Installers"
          value={users.filter(u => u.role === 'INSTALLER').length}
          icon={UsersIcon}
          color="text-solar-info"
          gradient="from-blue-500/20 to-blue-500/5"
        />
        <StatCard
          title="Govt Users"
          value={users.filter(u => u.role === 'GOVT').length}
          icon={UsersIcon}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-solar-card rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-solar-muted" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-solar-card rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-solar-muted">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-solar-night/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Assignments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solar-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-solar-night/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-solar-yellow rounded-full flex items-center justify-center mr-3">
                          <span className="text-solar-dark font-semibold text-sm">
                            {(user.first_name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-solar-primary">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.email || 'N/A')}
                          </div>
                          <div className="text-sm text-solar-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-solar-success text-white' : 'bg-solar-danger text-white'
                        }`}>
                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-solar-muted">
                      {user.region || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {user.admin_id && (
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-solar-orange" />
                            <span className="text-xs text-solar-primary">Admin: {user.admin_id.substring(0, 8)}</span>
                          </div>
                        )}
                        {user.installer_id && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-solar-info" />
                            <span className="text-xs text-solar-primary">Inst: {user.installer_id.substring(0, 8)}</span>
                          </div>
                        )}
                        {!user.admin_id && !user.installer_id && <span className="text-xs text-solar-muted italic">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-solar-muted">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="text-solar-yellow hover:text-solar-orange transition sun-button"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          className="text-solar-primary hover:text-solar-yellow transition sun-button"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
