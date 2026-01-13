import { useState, useEffect } from 'react'
import { Users as UsersIcon, UserPlus, Search, Filter, RefreshCw, Eye, Edit, User, Shield, Globe, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/stat-card'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'
import DataTable from '../../components/common/DataTable'
import { useMemo } from 'react'

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [admins, setAdmins] = useState([])
  const [installers, setInstallers] = useState([])
  const [plants, setPlants] = useState([])

  const fetchUsers = async () => {
    try {
      const [usersRes, installersRes, adminsRes, plantsRes] = await Promise.all([
        getRequest('/superadmin/users'),
        getRequest('/admin/installers'),
        getRequest('/superadmin/admins'),
        getRequest('/superadmin/plants')
      ])
      setUsers(usersRes.data.users || [])
      setInstallers(installersRes.data.installers || [])
      setAdmins(adminsRes.data.admins || [])
      setPlants(plantsRes.data.plants || [])
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
      case 'USER': return 'bg-solar-success/20 text-solar-success border border-solar-success/30'
      case 'ADMIN': return 'bg-solar-orange/20 text-solar-orange border border-solar-orange/30'
      case 'SUPER_ADMIN': return 'bg-solar-danger/20 text-solar-danger border border-solar-danger/30'
      default: return 'bg-solar-muted/20 text-solar-muted border border-solar-muted/30'
    }
  }

  const columns = useMemo(() => [
    {
      header: 'User Identity',
      cell: (row) => (
        <div className="flex items-center space-x-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-solar-yellow to-solar-orange flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
            <span className="text-white font-black text-xs">
              {(row.first_name || row.email || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-solar-primary text-sm tracking-tight">
              {row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : (row.email || 'N/A')}
            </span>
            <span className="text-[10px] text-solar-muted font-medium">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'System Access',
      accessorKey: 'role',
      cell: (row) => (
        <div className="flex flex-col space-y-1">
          <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg w-fit transition-all ${getRoleBadgeColor(row.role)}`}>
            {row.role}
          </span>
          <span className={`text-[8px] font-bold ${row.is_active ? 'text-solar-success' : 'text-solar-danger'} flex items-center`}>
            <div className={`w-1 h-1 rounded-full mr-1 ${row.is_active ? 'bg-solar-success' : 'bg-solar-danger'} animate-pulse`}></div>
            {row.is_active ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </span>
        </div>
      )
    },
    {
      header: 'Deployment Location',
      accessorKey: 'region',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Globe className="w-3 h-3 text-solar-panel/60" />
          <span className="text-xs font-bold text-solar-muted uppercase">{row.region || 'Unassigned'}</span>
        </div>
      )
    },
    {
      header: 'Structural Assignment',
      cell: (row) => (
        <div className="flex flex-col space-y-1.5 py-1">
          {userHasAssignments(row) ? (
            <>
              {row.admin_id && (
                <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
                  <Shield className="w-2.5 h-2.5 text-solar-orange" />
                  <span className="text-[9px] font-bold text-solar-primary tracking-tighter">
                    {admins.find(a => a.id === row.admin_id)?.first_name || 'Assigned Admin'}
                  </span>
                </div>
              )}
              {row.plant_id && (
                <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
                  <Zap className="w-2.5 h-2.5 text-solar-yellow" />
                  <span className="text-[9px] font-bold text-solar-primary tracking-tighter">
                    {plants.find(p => p.id === row.plant_id)?.name || 'Linked Plant'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <span className="text-[9px] text-solar-muted italic font-medium opacity-50">Base Instance</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/users/${row.id}`)}
            className="p-2 bg-solar-card hover:bg-solar-panel/10 rounded-lg text-solar-muted hover:text-solar-panel transition-all duration-200 shadow-sm border border-solar-border/30"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/users/${row.id}/edit`)}
            className="p-2 bg-solar-card hover:bg-solar-yellow/10 rounded-lg text-solar-muted hover:text-solar-yellow transition-all duration-200 shadow-sm border border-solar-border/30"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [navigate, admins, installers, plants])

  const userHasAssignments = (user) => {
    return user.admin_id || user.installer_id || user.plant_id
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
      <div className="glass-card rounded-2xl p-6 mb-8 group">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-solar-muted group-focus-within:text-solar-yellow transition-colors" />
            <input
              type="text"
              placeholder="Query database for users, endpoints, or emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-solar-bgActive/50 border border-solar-border/30 rounded-xl text-solar-primary placeholder-solar-muted/50 focus:outline-none focus:border-solar-yellow/50 focus:ring-4 focus:ring-solar-yellow/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-solar-muted uppercase tracking-widest bg-solar-night/30 px-4 py-2 rounded-lg border border-solar-border/10">
            <Filter className="w-3 h-3" />
            <span>Active Filters: {searchTerm ? 'Enabled' : 'None'}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <DataTable
          columns={columns}
          data={filteredUsers}
          initialPageSize={10}
          title="Consolidated User Directory"
          description="High-level overview and management of all system-wide access nodes."
          emptyMessage="No matching system entities found in the current regional scope."
          className="w-full"
        />
      </div>
    </div>
  )
}
