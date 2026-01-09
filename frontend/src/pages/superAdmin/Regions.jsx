import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus, RefreshCw, Users, Zap, Globe, Edit, Trash2, Eye } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'
import { getRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'
import DataTable from '../../components/common/DataTable'

export default function Regions() {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchRegions = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/superadmin/regions')
      // Backend returns array directly
      setRegions(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Failed to fetch regions:', error)
      notify.error('Failed to fetch regions')
      // Fallback to empty array
      setRegions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegions()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return
    
    try {
      setDeletingId(id)
      await deleteRequest(`/superadmin/regions/${id}`)
      notify.success('Region deleted successfully')
      fetchRegions()
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to delete region')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'INACTIVE': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'MAINTENANCE': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  const columns = [
    {
      header: 'Region',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-solar-panel rounded-lg flex items-center justify-center mr-3">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-solar-primary">{row.name}</div>
            {row.description && (
              <div className="text-xs text-solar-muted truncate max-w-xs">{row.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'State / Country',
      accessorKey: 'state',
      cell: (row) => (
        <div>
          <div className="text-sm text-solar-primary">{row.state}</div>
          <div className="text-xs text-solar-muted">{row.country}</div>
        </div>
      ),
    },
    {
      header: 'Timezone',
      accessorKey: 'timezone',
      cell: (row) => (
        <span className="text-sm text-solar-orange">{row.timezone || 'N/A'}</span>
      ),
    },
    {
      header: 'Users',
      accessorKey: 'expected_users',
      cell: (row) => (
        <div className="flex items-center text-sm text-solar-yellow font-semibold">
          <Users className="w-4 h-4 mr-1" />
          {row.expected_users || 0}
        </div>
      ),
    },
    {
      header: 'Plants',
      accessorKey: 'expected_plants',
      cell: (row) => (
        <div className="flex items-center text-sm text-solar-success font-semibold">
          <Zap className="w-4 h-4 mr-1" />
          {row.expected_plants || 0}
        </div>
      ),
    },
    {
      header: 'Capacity (MW)',
      accessorKey: 'capacity_mw',
      cell: (row) => (
        <div className="flex items-center text-sm text-solar-panel font-semibold">
          {row.capacity_mw || 0}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(row.status)}`}>
          {row.status || 'ACTIVE'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(`/regions/${row.id}`)}
            className="p-2 bg-solar-yellow/20 text-solar-yellow rounded-lg hover:bg-solar-yellow/30 transition"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate(`/regions/${row.id}/edit`)}
            className="p-2 bg-solar-panel/20 text-solar-panel rounded-lg hover:bg-solar-panel/30 transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            disabled={deletingId === row.id}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
            title="Delete"
          >
            {deletingId === row.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {loading && <SunLoader message="Loading regions..." />}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Region Management</h1>
          <p className="text-solar-muted mt-1">Manage regional operations and administrators</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchRegions}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => navigate('/regions/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-panel text-white font-semibold rounded-lg hover:bg-solar-panel/80 transition sun-button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Region</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Regions"
          value={regions.length}
          icon={Globe}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
        <StatCard
          title="Total Users"
          value={regions.reduce((sum, r) => sum + (r.expected_users || 0), 0)}
          icon={Users}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Total Plants"
          value={regions.reduce((sum, r) => sum + (r.expected_plants || 0), 0)}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Capacity (MW)"
          value={regions.reduce((sum, r) => sum + (r.capacity_mw || 0), 0)}
          icon={MapPin}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
      </div>

      {/* Regions Table */}
      <DataTable
        columns={columns}
        data={regions}
        title="Regions"
        description="List of all registered regions"
        emptyMessage="No regions found"
        showPagination={true}
        initialPageSize={10}
      />
    </div>
  )
}
