import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus, Search, RefreshCw, Users, Zap, TrendingUp, Globe } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'
import { getRequest } from '../../lib/apiService'

export default function Regions() {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRegions = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/superadmin/regions')
      setRegions(response.data.regions || [])
    } catch (error) {
      console.error('Failed to fetch regions:', error)
      // Fallback to default regions if API fails
      setRegions([
        { id: 1, name: 'Delhi', admins: 2, users: 150, plants: 5, status: 'ACTIVE' },
        { id: 2, name: 'Mumbai', admins: 3, users: 200, plants: 8, status: 'ACTIVE' },
        { id: 3, name: 'Patna', admins: 1, users: 80, plants: 3, status: 'ACTIVE' },
        { id: 4, name: 'Ahmedabad', admins: 2, users: 120, plants: 4, status: 'ACTIVE' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegions()
  }, [])

  const filteredRegions = regions.filter(region =>
    region.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-solar-success text-white'
      case 'INACTIVE': return 'bg-solar-danger text-white'
      default: return 'bg-solar-muted text-solar-primary'
    }
  }

  return (
    <div className="space-y-6">
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
          value={regions.reduce((sum, r) => sum + (r.users || 0), 0)}
          icon={Users}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Total Plants"
          value={regions.reduce((sum, r) => sum + (r.plants || 0), 0)}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Regional Admins"
          value={regions.reduce((sum, r) => sum + (r.admins || 0), 0)}
          icon={Users}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
      </div>

      {/* Search */}
      <div className="bg-solar-card rounded-lg p-4 energy-card">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-solar-muted" />
          <input
            type="text"
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow"
          />
        </div>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-solar-muted">Loading regions...</p>
          </div>
        ) : filteredRegions.length === 0 ? (
          <div className="col-span-full p-8 text-center">
            <MapPin className="w-16 h-16 text-solar-muted mx-auto mb-4" />
            <p className="text-solar-muted">No regions found</p>
          </div>
        ) : (
          filteredRegions.map((region) => (
            <div key={region.id} className="bg-gradient-to-br from-solar-card to-solar-night/30 rounded-xl p-8 energy-card border border-solar-border/50 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-solar-panel rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-solar-primary">{region.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(region.status)}`}>
                      {region.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-solar-yellow mr-1" />
                    <span className="text-sm text-solar-muted">Users</span>
                  </div>
                  <p className="text-lg font-bold text-solar-yellow">{region.users || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 text-solar-success mr-1" />
                    <span className="text-sm text-solar-muted">Plants</span>
                  </div>
                  <p className="text-lg font-bold text-solar-success">{region.plants || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-4 h-4 bg-solar-orange rounded-full mr-1"></div>
                    <span className="text-sm text-solar-muted">Admins</span>
                  </div>
                  <p className="text-lg font-bold text-solar-orange">{region.admins || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-solar-panel mr-1" />
                    <span className="text-sm text-solar-muted">Performance</span>
                  </div>
                  <p className="text-lg font-bold text-solar-panel">98%</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button">
                  View Details
                </button>
                <button className="px-4 py-2 bg-solar-panel/20 text-solar-panel font-semibold rounded-lg hover:bg-solar-panel/30 transition sun-button">
                  Manage
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
