import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Zap, MapPin, Battery, TrendingUp, ArrowLeft, Edit } from 'lucide-react'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import { Button } from '../../components/ui/button'
import SunLoader from '../../components/SunLoader'

export default function PlantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setLoading(true)
        const response = await getRequest(`/superadmin/plants/${id}`)
        const plantData = response.data?.plant || response.data || response
        setPlant(plantData)
      } catch (error) {
        console.error('Failed to fetch plant:', error)
        notify.error('Failed to load plant data')
      } finally {
        setLoading(false)
      }
    }
    fetchPlant()
  }, [id])

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-solar-success text-white'
      case 'MAINTENANCE': return 'bg-solar-warning text-solar-dark'
      case 'INACTIVE': return 'bg-solar-danger text-white'
      default: return 'bg-solar-muted text-solar-primary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SunLoader message="Loading plant details..." />
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="text-center py-12">
        <p className="text-solar-muted">Plant not found</p>
        <Button onClick={() => navigate('/plants')} className="mt-4">
          Back to Plants
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/plants')}
            className="p-2 rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-muted" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">{plant.name}</h1>
            <p className="text-solar-muted mt-1">Plant Details</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/plants/${id}/edit`)}
          className="bg-solar-yellow text-solar-dark hover:bg-solar-orange flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Plant</span>
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(plant.status)}`}>
          {plant.status || 'ACTIVE'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Zap className="w-5 h-5 text-solar-yellow mr-2" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-solar-muted">Plant Name</p>
              <p className="text-solar-primary font-semibold">{plant.name}</p>
            </div>
            <div>
              <p className="text-sm text-solar-muted">Location</p>
              <p className="text-solar-primary">{plant.location}</p>
            </div>
            <div>
              <p className="text-sm text-solar-muted">Region</p>
              <p className="text-solar-primary">{plant.region || 'N/A'}</p>
            </div>
            {plant.description && (
              <div>
                <p className="text-sm text-solar-muted">Description</p>
                <p className="text-solar-primary">{plant.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Capacity & Performance */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Battery className="w-5 h-5 text-solar-success mr-2" />
            Capacity & Performance
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-solar-muted">Capacity</p>
              <p className="text-solar-primary font-semibold text-xl">{plant.capacity_kw} kW</p>
            </div>
            <div>
              <p className="text-sm text-solar-muted">Current Output</p>
              <p className="text-solar-yellow font-semibold text-xl">{plant.current_output_kw || 0} kW</p>
            </div>
            <div>
              <p className="text-sm text-solar-muted">Efficiency</p>
              <p className="text-solar-orange font-semibold text-xl">{plant.efficiency || 0}%</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-solar-orange mr-2" />
            Plant Location
          </h2>
          <div className="space-y-4">
            {plant.latitude && plant.longitude ? (
              <>
                <div>
                  <p className="text-sm text-solar-muted">Latitude</p>
                  <p className="text-solar-primary">{plant.latitude}</p>
                </div>
                <div>
                  <p className="text-sm text-solar-muted">Longitude</p>
                  <p className="text-solar-primary">{plant.longitude}</p>
                </div>
              </>
            ) : (
              <p className="text-solar-muted">No location data available</p>
            )}
          </div>
        </div>

        {/* Status Details */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-solar-primary mr-2" />
            Status Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-solar-muted">Current Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getStatusBadgeColor(plant.status)}`}>
                {plant.status || 'ACTIVE'}
              </span>
            </div>
            {plant.created_at && (
              <div>
                <p className="text-sm text-solar-muted">Created At</p>
                <p className="text-solar-primary">{new Date(plant.created_at).toLocaleDateString()}</p>
              </div>
            )}
            {plant.updated_at && (
              <div>
                <p className="text-sm text-solar-muted">Last Updated</p>
                <p className="text-solar-primary">{new Date(plant.updated_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
