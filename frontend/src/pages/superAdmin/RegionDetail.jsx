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



  if (loading) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Synchronizing regional grid data..." size="large" fullscreen={false} />
        </div>
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
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">
              {region.name} <span className="text-solar-orange ml-2 text-sm font-black tracking-widest">[REG-NODE-{region.id?.toString().slice(-4)}]</span>
            </h1>
            <p className="text-solar-muted mt-1 font-medium italic">Regional Infrastructure Oversight</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/regions/${id}/edit`)}
          className="sun-button px-6 py-2.5"
        >
          <div className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Update Regional Parameters</span>
          </div>
        </button>
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
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Globe className="w-5 h-5 text-solar-yellow mr-3 group-hover:rotate-12 transition-transform" />
            Geographical Intelligence
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-solar-border/30 pb-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Sector Designation</span>
              <span className="text-sm font-black text-solar-primary">{region.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border/30 pb-3">
              <span className="text-xs font-bold text-solar-muted uppercase">State Jurisdiction</span>
              <span className="text-sm font-black text-solar-primary">{region.state}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border/30 pb-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Sovereign Territory</span>
              <span className="text-sm font-black text-solar-primary">{region.country}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border/30 pb-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Temporal Alignment</span>
              <span className="text-sm font-black text-solar-orange">{region.timezone}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-bold text-solar-muted uppercase">Operational State</span>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${region.status === 'ACTIVE' 
                ? 'bg-solar-success/10 text-solar-success border-solar-success/20' 
                : 'bg-solar-warning/10 text-solar-warning border-solar-warning/20'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${region.status === 'ACTIVE' ? 'bg-solar-success' : 'bg-solar-warning'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{region.status || 'ACTIVE'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Description */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <MapPin className="w-5 h-5 text-solar-orange mr-3 group-hover:scale-110 transition-transform" />
            Deployment Metadata
          </h2>
          <div className="space-y-4">
            {region.description && (
              <div className="border-b border-solar-border/30 pb-3">
                <span className="text-xs font-bold text-solar-muted uppercase block mb-2">Architectural Brief</span>
                <p className="text-sm font-medium text-solar-muted italic leading-relaxed">{region.description}</p>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-solar-border/30 pb-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Latitudinal Point</span>
              <span className="text-sm font-black text-solar-primary">{region.latitude || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-solar-border/30 pb-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Longitudinal Point</span>
              <span className="text-sm font-black text-solar-primary">{region.longitude || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-bold text-solar-muted uppercase">System Registry ID</span>
              <span className="text-[10px] font-black text-solar-muted font-mono">{region.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="solar-glass rounded-2xl p-6 group">
        <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
          <Calendar className="w-5 h-5 text-solar-success mr-3 group-hover:scale-110 transition-transform" />
          Infrastructure Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-between items-center p-4 bg-solar-night/30 rounded-xl border border-solar-border/10">
            <span className="text-xs font-bold text-solar-muted uppercase">Registry Event</span>
            <span className="text-sm font-black text-solar-primary">
              {region.created_at ? new Date(region.created_at).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-solar-night/30 rounded-xl border border-solar-border/10">
            <span className="text-xs font-bold text-solar-muted uppercase">Last Synchronization</span>
            <span className="text-sm font-black text-solar-yellow">
              {region.updated_at ? new Date(region.updated_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start pt-4">
        <button
          onClick={() => navigate('/regions')}
          className="flex items-center space-x-2 px-6 py-2.5 solar-glass rounded-xl text-solar-primary font-black uppercase tracking-widest text-[10px] hover:bg-solar-panel/10 transition-all border border-solar-border/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Regional Fleet
        </button>
      </div>
    </div>
  )
}
