import { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, Plus, Search, Filter, RefreshCw, MapPin, Battery, TrendingUp } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'

const API_BASE_URL = 'http://localhost:8080'

export default function Plants() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRegion, setFilterRegion] = useState('ALL')
  const token = localStorage.getItem('token')

  const fetchPlants = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/superadmin/plants`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlants(response.data.plants || [])
    } catch (error) {
      console.error('Failed to fetch plants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = filterRegion === 'ALL' || plant.region === filterRegion
    return matchesSearch && matchesRegion
  })

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-solar-success text-white'
      case 'MAINTENANCE': return 'bg-solar-warning text-solar-dark'
      case 'INACTIVE': return 'bg-solar-danger text-white'
      default: return 'bg-solar-muted text-solar-primary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Solar Plant Management</h1>
          <p className="text-solar-muted mt-1">Monitor and manage all solar energy plants</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPlants}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-solar-success text-white font-semibold rounded-lg hover:bg-solar-success/80 transition sun-button">
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
          icon={Battery}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Avg Efficiency"
          value={`${plants.length > 0 ? Math.round(plants.reduce((sum, p) => sum + (p.efficiency || 0), 0) / plants.length) : 0}%`}
          icon={TrendingUp}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-solar-card rounded-lg p-4 energy-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-solar-muted" />
            <input
              type="text"
              placeholder="Search plants by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-solar-muted" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-3 py-2 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow"
            >
              <option value="ALL">All Regions</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Patna">Patna</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-solar-muted">Loading plants...</p>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="col-span-full p-8 text-center">
            <Zap className="w-16 h-16 text-solar-muted mx-auto mb-4" />
            <p className="text-solar-muted">No plants found</p>
          </div>
        ) : (
          filteredPlants.map((plant) => (
            <div key={plant.id} className="bg-gradient-to-br from-solar-card to-solar-night/30 rounded-xl p-8 energy-card border border-solar-border/50 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-solar-success rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-solar-primary">{plant.name || 'Unnamed Plant'}</h3>
                    <div className="flex items-center text-sm text-solar-muted">
                      <MapPin className="w-3 h-3 mr-1" />
                      {plant.location || 'Unknown Location'}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(plant.status)}`}>
                  {plant.status || 'ACTIVE'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-solar-muted">Capacity</span>
                  <span className="text-sm font-semibold text-solar-primary">{plant.capacity_kw || 0} kW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-solar-muted">Current Output</span>
                  <span className="text-sm font-semibold text-solar-yellow">{plant.current_output_kw || 0} kW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-solar-muted">Efficiency</span>
                  <span className="text-sm font-semibold text-solar-orange">{plant.efficiency || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-solar-muted">Region</span>
                  <span className="text-sm font-semibold text-solar-panel">{plant.region || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-solar-border">
                <button className="w-full px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
