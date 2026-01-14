import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, ArrowLeft, User, Mail, Calendar, Edit, Trash2, MapPin } from 'lucide-react'
import { getRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'

export default function AdminDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await getRequest(`/superadmin/admins/${id}`)
        setAdmin(response.data.admin || response.data)
      } catch (error) {
        console.error('Failed to fetch admin:', error)
        setError('Failed to load admin details')
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return
    
    try {
      await deleteRequest(`/superadmin/admins/${id}`)
      navigate('/admins')
    } catch (error) {
      console.error('Failed to delete admin:', error)
      notify.error(error.response?.data?.error || 'Failed to delete admin')
    }
  }



  if (loading) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Synchronizing admin telemetry..." size="large" />
        </div>
      </div>
    )
  }

  if (error || !admin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admins')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">System Exception</h1>
            <p className="text-solar-muted mt-1">Telemetry acquisition failed</p>
          </div>
        </div>
        <div className="solar-glass rounded-2xl p-8 text-center border-solar-danger/20">
          <p className="text-solar-danger font-bold text-lg">{error || 'Admin node not found in registry'}</p>
          <button 
            onClick={() => navigate('/admins')}
            className="mt-6 sun-button px-6 py-2"
          >
            Return to Fleet Overview
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
            onClick={() => navigate('/admins')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Admin Profile Intelligence</h1>
            <p className="text-solar-muted mt-1">Personnel identification and access parameters</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admins/${id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 text-white font-semibold rounded-lg transition sun-button"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-white font-semibold rounded-lg transition sun-button"
          >
            <Trash2 className="w-4 h-4" />
            <span>Decommission Node</span>
          </button>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="solar-glass rounded-2xl p-8 group">
        <div className="flex items-center space-x-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-linear-to-br from-solar-panel to-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <span className="text-white text-4xl font-black">
                {admin.first_name?.charAt(0)?.toUpperCase() || admin.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-solar-success rounded-lg border-4 border-solar-bg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h2 className="text-3xl font-black text-solar-primary tracking-tight">
                {admin.first_name} {admin.last_name}
              </h2>
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg bg-solar-panel/20 text-solar-panel border border-solar-panel/30">
                Authorized Admin
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-solar-muted">
                <Mail className="w-4 h-4 text-solar-yellow" />
                <span className="text-sm font-medium">{admin.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${admin.status === 'ACTIVE' ? 'bg-solar-success' : 'bg-solar-danger'}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${admin.status === 'ACTIVE' ? 'text-solar-success' : 'text-solar-danger'}`}>
                  System {admin.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="solar-glass rounded-2xl p-6">
          <h3 className="text-lg font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase">
            <User className="w-5 h-5 mr-3 text-solar-yellow" />
            Personnel Identity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">First Name</span>
              <span className="text-sm font-black text-solar-primary">{admin.first_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Last Name</span>
              <span className="text-sm font-black text-solar-primary">{admin.last_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Primary Email</span>
              <span className="text-sm font-black text-solar-yellow">{admin.email}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Contact Signal</span>
              <span className="text-sm font-black text-solar-primary">{admin.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="solar-glass rounded-2xl p-6">
          <h3 className="text-lg font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase">
            <Shield className="w-5 h-5 mr-3 text-solar-panel" />
            Security Intelligence
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Access Privilege</span>
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg bg-solar-panel/20 text-solar-panel border border-solar-panel/30">
                Administrator
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Operational Status</span>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${admin.status === 'ACTIVE' 
                ? 'bg-solar-success/10 text-solar-success border-solar-success/20' 
                : 'bg-solar-danger/10 text-solar-danger border-solar-danger/20'}`}>
                {admin.status || 'ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Regional Jurisdiction</span>
              <span className="flex items-center text-sm font-black text-solar-orange">
                <MapPin className="w-4 h-4 mr-2" />
                {admin.region || 'Global Oversight'}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="solar-glass rounded-2xl p-6">
          <h3 className="text-lg font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase">
            <Calendar className="w-5 h-5 mr-3 text-solar-success" />
            Temporal Logs
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Initial Deployment</span>
              <span className="text-sm font-black text-solar-primary">
                {admin.created_at ? new Date(admin.created_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Last Synchronization</span>
              <span className="text-sm font-black text-solar-primary">
                {admin.updated_at ? new Date(admin.updated_at).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="solar-glass rounded-2xl p-6">
          <h3 className="text-lg font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase">
            <TrendingUp className="w-5 h-5 mr-3 text-solar-orange" />
            Impact Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Registry UUID</span>
              <span className="text-[10px] font-black text-solar-muted font-mono">{admin.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-xs font-bold text-solar-muted uppercase">Personnel Managed</span>
              <span className="text-sm font-black text-solar-success">{admin.users_count || 0} Nodes</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-bold text-solar-muted uppercase">Infrastructure Oversight</span>
              <span className="text-sm font-black text-solar-yellow">{admin.plants_count || 0} Assets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
