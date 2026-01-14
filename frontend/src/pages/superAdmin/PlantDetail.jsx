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



  if (loading) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Acquiring plant telemetry..." size="large" />
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/plants')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Asset Registry Error</h1>
            <p className="text-solar-muted mt-1">Infrastructure node not detected</p>
          </div>
        </div>
        <div className="solar-glass rounded-2xl p-12 text-center">
          <Zap className="w-12 h-12 text-solar-muted mx-auto mb-4 opacity-20" />
          <p className="text-solar-muted font-bold text-lg">The requested plant node is not registered in the system telemetry database.</p>
          <button 
            onClick={() => navigate('/plants')}
            className="mt-6 sun-button px-6 py-2"
          >
            Back to Power Grid
          </button>
        </div>
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
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">
              {plant.name} <span className="text-solar-yellow ml-2 text-sm font-black tracking-widest">[NODE-{plant.id?.toString().padStart(4, '0')}]</span>
            </h1>
            <p className="text-solar-muted mt-1 font-medium italic">Operational Asset Intelligence Overview</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/plants/${id}/edit`)}
          className="sun-button px-6 py-2.5"
        >
          <div className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Modify Asset Parameters</span>
          </div>
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${plant.status === 'ACTIVE' 
          ? 'bg-solar-success/10 text-solar-success border-solar-success/20' 
          : plant.status === 'MAINTENANCE'
          ? 'bg-solar-warning/10 text-solar-warning border-solar-warning/20'
          : 'bg-solar-danger/10 text-solar-danger border-solar-danger/20'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${plant.status === 'ACTIVE' ? 'bg-solar-success' : plant.status === 'MAINTENANCE' ? 'bg-solar-warning' : 'bg-solar-danger'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-wider">
            {plant.status || 'ACTIVE'} Telemetry Signal
          </span>
        </div>
        <div className="h-4 w-px bg-solar-border/30"></div>
        <div className="flex items-center space-x-2 text-solar-muted">
          <MapPin className="w-3 h-3 text-solar-orange" />
          <span className="text-[10px] font-bold uppercase tracking-tight">{plant.region || 'Global Fleet'} Jurisdiction</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Zap className="w-5 h-5 text-solar-yellow mr-3 group-hover:scale-110 transition-transform" />
            Structural Deployment
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Entity Designation</span>
              <span className="text-sm font-black text-solar-primary">{plant.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Deployment Location</span>
              <span className="text-sm font-black text-solar-primary">{plant.location}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Regional Sector</span>
              <span className="text-sm font-black text-solar-orange uppercase tracking-tighter">{plant.region || 'Unassigned'}</span>
            </div>
            {plant.description && (
              <div className="pt-2">
                <p className="text-xs font-bold text-solar-muted uppercase mb-1">Logistical Brief</p>
                <p className="text-sm font-medium text-solar-muted italic leading-relaxed">{plant.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Capacity & Performance */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Battery className="w-5 h-5 text-solar-success mr-3 group-hover:scale-110 transition-transform" />
            Energy Intelligence
          </h2>
          <div className="space-y-8 py-2">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold text-solar-muted uppercase mb-1">Grid Rating</p>
                <p className="text-3xl font-black text-solar-primary">{plant.capacity_kw} <span className="text-sm text-solar-muted font-bold">kW</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-solar-muted uppercase mb-1">Live Feed</p>
                <p className="text-3xl font-black text-solar-yellow">{plant.current_output_kw || 0} <span className="text-sm text-solar-muted font-bold">kW</span></p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-solar-muted uppercase">Efficiency Threshold</span>
                <span className="text-sm font-black text-solar-orange">{plant.efficiency || 0}%</span>
              </div>
              <div className="w-full h-3 bg-solar-night/50 rounded-full overflow-hidden border border-solar-border/20">
                <div 
                  className="h-full bg-linear-to-r from-solar-panel via-solar-yellow to-solar-orange transition-all duration-1000 shadow-[0_0_10px_rgba(255,183,0,0.5)]" 
                  style={{ width: `${plant.efficiency || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <MapPin className="w-5 h-5 text-solar-orange mr-3 group-hover:scale-110 transition-transform" />
            Geospatial coordinates
          </h2>
          <div className="space-y-4">
            {plant.latitude && plant.longitude ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-solar-night/30 rounded-xl border border-solar-border/10">
                  <p className="text-xs font-bold text-solar-muted uppercase mb-1">Latitudinal Axis</p>
                  <p className="text-lg font-black text-solar-primary">{plant.latitude}</p>
                </div>
                <div className="p-4 bg-solar-night/30 rounded-xl border border-solar-border/10">
                  <p className="text-xs font-bold text-solar-muted uppercase mb-1">Longitudinal Axis</p>
                  <p className="text-lg font-black text-solar-primary">{plant.longitude}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-solar-night/30 rounded-2xl border border-dashed border-solar-border/30">
                <Globe className="w-8 h-8 text-solar-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-solar-muted uppercase">Satellite Link Not Established</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Details */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <TrendingUp className="w-5 h-5 text-solar-panel mr-3 group-hover:scale-110 transition-transform" />
            Temporal Registry
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Registry Event</span>
              <span className="text-sm font-black text-solar-primary">
                {plant.created_at ? new Date(plant.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Initial Sync'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Last Telemetry</span>
              <span className="text-sm font-black text-solar-yellow">
                {plant.updated_at ? new Date(plant.updated_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Continuous'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-bold text-solar-muted uppercase">Access Status</span>
              <span className="text-[10px] font-black text-solar-success uppercase tracking-widest bg-solar-success/10 px-2 py-0.5 rounded border border-solar-success/20">Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
