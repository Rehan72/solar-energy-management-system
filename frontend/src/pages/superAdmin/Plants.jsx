import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Plus, RefreshCw, Trash2, Eye } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'
import { getRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'
import DataTable from '../../components/common/DataTable'

export default function Plants() {
  const navigate = useNavigate()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPlants = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/superadmin/plants')
      setPlants(response.data.plants || [])
    } catch (error) {
      console.error('Failed to fetch plants:', error)
      notify.error('Failed to load plants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  const getStatusBadgeColor = (status) => {
    const statusUpper = (status || '').toUpperCase()
    switch (statusUpper) {
      case 'ACTIVE': 
        return 'bg-green-500 text-white px-2 py-1 rounded-full text-xs'
      case 'MAINTENANCE': 
        return 'bg-yellow-500 text-dark px-2 py-1 rounded-full text-xs'
      case 'INACTIVE': 
        return 'bg-red-500 text-white px-2 py-1 rounded-full text-xs'
      default: 
        return 'bg-gray-500 text-white px-2 py-1 rounded-full text-xs'
    }
  }

  // Define table columns
  const columns = useMemo(() => [
    {
      header: 'Plant Name',
      accessorKey: 'name',
      cellClassName: 'font-semibold text-solar-primary',
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cellClassName: 'text-solar-muted',
    },
    {
      header: 'Region',
      accessorKey: 'region',
      // cell: (row) => getRegionName(row.region_id) || row.region || 'N/A',
      cellClassName: 'text-solar-panel',
    },
    {
      header: 'Capacity (kW)',
      accessorKey: 'capacity_kw',
      cellClassName: 'text-solar-primary font-semibold',
    },
    {
      header: 'Current Output',
      accessorKey: 'current_output_kw',
      cell: (row) => `${row.current_output_kw || 0} kW`,
      cellClassName: 'text-solar-yellow font-semibold',
    },
    {
      header: 'Efficiency',
      accessorKey: 'efficiency',
      cell: (row) => `${row.efficiency || 0}%`,
      cellClassName: 'text-solar-orange font-semibold',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <span className={getStatusBadgeColor(row.status)}>
          {row.status || 'ACTIVE'}
        </span>
      ),
      cellClassName: 'text-center',
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/plants/${row.id}`)}
            className="px-3 py-1 bg-solar-primary text-white text-xs font-semibold rounded hover:bg-solar-panel transition"
            title="View"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => navigate(`/plants/${row.id}/edit`)}
            className="px-3 py-1 bg-solar-yellow text-solar-dark text-xs font-semibold rounded hover:bg-solar-orange transition"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeletePlant(row)}
            className="px-3 py-1 bg-solar-danger text-white text-xs font-semibold rounded hover:bg-red-600 transition"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
      cellClassName: 'text-center',
    },
  ], [navigate])

  const handleDeletePlant = async (plant) => {
    if (window.confirm(`Are you sure you want to delete "${plant.name}"?`)) {
      try {
        await deleteRequest(`/superadmin/plants/${plant.id}`)
        notify.success('Plant deleted successfully')
        fetchPlants()
      } catch (error) {
        notify.error(error.response?.data?.message || 'Failed to delete plant')
      }
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-solar-bg/80 z-50 flex flex-col items-center justify-center">
          <SunLoader message="Loading plants..." size="large" />
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Solar Plant Management</h1>
          <p className="text-solar-muted mt-1">Monitor and manage all solar energy plants</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => { fetchPlants() }}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => navigate('/plants/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-success text-white font-semibold rounded-lg hover:bg-solar-success/80 transition sun-button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plant</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Plants"
          value={plants.length}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Active Plants"
          value={plants.filter(p => p.status === 'ACTIVE').length}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Total Capacity"
          value={`${plants.reduce((sum, p) => sum + (p.capacity_kw || 0), 0)} kW`}
          icon={Zap}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Avg Efficiency"
          value={`${plants.length > 0 ? Math.round(plants.reduce((sum, p) => sum + (p.efficiency || 0), 0) / plants.length) : 0}%`}
          icon={Zap}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
      </div>

      {/* Plants Table */}
      <DataTable
        columns={columns}
        data={plants}
        initialPageSize={10}
        showPagination={true}
        showPageSize={true}
        pageSizeOptions={[5, 10, 20, 50]}
        title="All Solar Plants"
        description="List of all registered solar power plants"
        emptyMessage="No plants found"
        className="w-full"
      />
    </div>
  )
}
