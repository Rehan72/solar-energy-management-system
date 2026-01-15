import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Plus, RefreshCw, Trash2, Eye, Globe, MapPin, Edit, TrendingUp } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'
import { getRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'
import DataTable from '../../components/common/DataTable'

export default function Plants() {
  const navigate = useNavigate()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('')

  const regions = [
    'Delhi',
    'Mumbai',
    'Patna',
    'Ahmedabad',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Jaipur'
  ]

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true)
      const url = selectedRegion ? `/superadmin/plants?region=${selectedRegion}` : '/superadmin/plants'
      const response = await getRequest(url)
      setPlants(response.data.plants || [])
    } catch (error) {
      console.error('Failed to fetch plants:', error)
      notify.error('Failed to load plants')
    } finally {
      setLoading(false)
    }
  }, [selectedRegion])

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])



  // Define table columns
  const columns = useMemo(() => [
    {
      header: 'Plant Entity',
      cell: (row) => (
        <div className="flex items-center space-x-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-solar-panel to-blue-600 flex items-center justify-center shadow-lg transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-solar-primary group-hover:text-solar-dark text-sm tracking-tight">{row.name}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-2 h-2 text-solar-muted group-hover:text-solar-dark/70" />
              <span className="text-[10px] text-solar-muted group-hover:text-solar-dark/70 font-medium">{row.location}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Regional Scoped',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Globe className="w-3 h-3 text-solar-panel/60" />
          <span className="text-xs font-black text-solar-panel uppercase tracking-tighter">{row.region}</span>
        </div>
      )
    },
    {
      header: 'Power Capacity',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-solar-primary group-hover:text-solar-dark">{row.capacity_kw} <span className="text-[9px] text-solar-muted group-hover:text-solar-dark/70">kW</span></span>
          <div className="w-16 h-1 bg-solar-muted/10 group-hover:bg-solar-dark/20 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-solar-yellow group-hover:bg-solar-dark" style={{ width: `${Math.min((row.current_output_kw / row.capacity_kw) * 100, 100)}%` }}></div>
          </div>
        </div>
      )
    },
    {
      header: 'Live Performance',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-sm font-black text-solar-yellow">{row.current_output_kw || 0} kW</span>
            <span className="text-[8px] font-bold text-solar-success uppercase">Active Output</span>
          </div>
          <div className="flex flex-col border-l border-solar-border/30 pl-3">
            <span className="text-xs font-bold text-solar-orange">{row.efficiency || 0}%</span>
            <span className="text-[8px] font-bold text-solar-muted uppercase">Efficiency</span>
          </div>
        </div>
      )
    },
    {
      header: 'Operational Status',
      cell: (row) => (
        <div className="flex flex-col space-y-1">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black text-center border ${row.status === 'ACTIVE'
            ? 'bg-solar-success/10 text-solar-success border-solar-success/20'
            : 'bg-solar-warning/10 text-solar-warning border-solar-warning/20'
            }`}>
            {row.status || 'ACTIVE'}
          </span>
          <span className="text-[8px] font-bold text-solar-muted text-center tracking-tighter uppercase whitespace-nowrap">
            {row.status === 'ACTIVE' ? 'Telemetry Received' : 'Maintenance Mode'}
          </span>
        </div>
      )
    },
    {
      header: 'Control Suite',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/plants/${row.id}`)}
            className="p-2 bg-solar-card hover:bg-solar-panel/10 rounded-lg text-solar-muted hover:text-solar-panel transition-all shadow-sm border border-solar-border/30"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/plants/${row.id}/edit`)}
            className="p-2 bg-solar-card hover:bg-solar-yellow/10 rounded-lg text-solar-muted hover:text-solar-yellow transition-all shadow-sm border border-solar-border/30"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeletePlant(row)}
            className="p-2 bg-solar-card hover:bg-solar-danger/10 rounded-lg text-solar-muted hover:text-solar-danger transition-all shadow-sm border border-solar-border/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
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
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Loading plants..." size="large" />
        </div>
      )}

      {/* Filters */}
      <div className="solar-glass rounded-2xl p-6 group">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Globe className="w-5 h-5 text-solar-panel group-hover:rotate-12 transition-transform" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="solar-input min-w-[200px]"
            >
              <option value="">Global Scoped (All Regions)</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-solar-night/30 px-3 py-1.5 rounded-lg border border-solar-border/10">
              <div className="w-1.5 h-1.5 rounded-full bg-solar-yellow animate-pulse"></div>
              <span className="text-[10px] font-black text-solar-muted uppercase">Live Monitoring Engaged</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Solar Plant Management</h1>
          <p className="text-solar-muted mt-1">Monitor and manage all solar energy plants</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => { fetchPlants() }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => navigate('/plants/create')}
            className="flex items-center space-x-2 px-4 py-2 text-white font-semibold rounded-lg transition sun-button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plant Node</span>
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

      <DataTable
        columns={columns}
        data={plants}
        initialPageSize={10}
        showPagination={true}
        showPageSize={true}
        pageSizeOptions={[5, 10, 20, 50]}
        title="Fleet Infrastructure Management"
        description="Global deployment overview of all solar power generation nodes and their operational health."
        emptyMessage="No plants found"
        className="w-full"
      />
    </div>
  )
}
