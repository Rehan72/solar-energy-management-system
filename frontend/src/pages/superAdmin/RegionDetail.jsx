import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Globe, Users, Zap, ArrowLeft, Edit, Calendar } from 'lucide-react'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/ui/stat-card'

export default function RegionDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [region, setRegion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        setLoading(true)
        const response = await getRequest('/superadmin/regions')
        const regions = Array.isArray(response.data) ? response.data : []
        const foundRegion = regions.find(r => r.id === id)
        
        if (foundRegion) {
          setRegion(foundRegion)
        } else {
          notify.error('Region not found')
          navigate('/regions')
        }
      } catch (error) {
        console.error('Failed to fetch region:', error)
        notify.error('Failed to fetch region')
        navigate('/regions')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRegion()
    }
  }, [id, navigate])

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'INACTIVE': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'MAINTENANCE': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-solar-yellow border-t-transparent"></div>
      </div>
    )
  }

  if (!region) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/regions')}
            className="p-2 rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-muted" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">{region.name}</h1>
            <p className="text-solar-muted mt-1">Region Details</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/regions/${id}/edit`)}
          className="bg-solar-yellow text-solar-dark hover:bg-solar-orange flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Region</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Expected Users"
          value={region.expected_users || 0}
          icon={Users}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Expected Plants"
          value={region.expected_plants || 0}
          icon={Zap}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Capacity (MW)"
          value={region.capacity_mw || 0}
          icon={MapPin}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Status"
          value={region.status || 'ACTIVE'}
          icon={Globe}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
      </div>

      {/* Region Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Globe className="w-5 h-5 text-solar-yellow mr-2" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-solar-border pb-2">
              <span className="text-solar-muted">Region Name</span>
              <span className="text-solar-primary font-semibold">{region.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border pb-2">
              <span className="text-solar-muted">State/Province</span>
              <span className="text-solar-primary">{region.state}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border pb-2">
              <span className="text-solar-muted">Country</span>
              <span className="text-solar-primary">{region.country}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border pb-2">
              <span className="text-solar-muted">Timezone</span>
              <span className="text-solar-orange">{region.timezone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-solar-muted">Status</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(region.status)}`}>
                {region.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Description */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-solar-orange mr-2" />
            Location & Description
          </h2>
          <div className="space-y-4">
            {region.description && (
              <div className="border-b border-solar-border pb-2">
                <span className="text-solar-muted block mb-1">Description</span>
                <p className="text-solar-primary">{region.description}</p>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-solar-border pb-2">
              <span className="text-solar-muted">Latitude</span>
              <span className="text-solar-primary">{region.latitude || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border pb-2">
              <span className="text-solar-muted">Longitude</span>
              <span className="text-solar-primary">{region.longitude || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-solar-muted">Region ID</span>
              <span className="text-solar-muted text-xs">{region.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-solar-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
          <Calendar className="w-5 h-5 text-solar-success mr-2" />
          Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-between items-center">
            <span className="text-solar-muted">Created At</span>
            <span className="text-solar-primary">
              {region.created_at ? new Date(region.created_at).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-solar-muted">Last Updated</span>
            <span className="text-solar-primary">
              {region.updated_at ? new Date(region.updated_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          type="button"
          onClick={() => navigate('/regions')}
          className="bg-solar-card text-solar-primary hover:bg-solar-panel/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Regions
        </Button>
      </div>
    </div>
  )
}
