import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, ArrowLeft, User, Mail, Calendar, Shield, MapPin, Edit, Trash2 } from 'lucide-react'
import { getRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'

export default function UserDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getRequest(`/superadmin/admins/${id}`)
        setUser(response.data.user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setError('Failed to load user details')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id, token])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await deleteRequest(`/superadmin/admins/${id}`)
      navigate('/users')
    } catch (error) {
      console.error('Failed to delete user:', error)
      notify.error('Failed to delete user')
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-solar-yellow text-solar-dark'
      case 'ADMIN': return 'bg-solar-orange text-white'
      case 'USER': return 'bg-solar-success text-white'
      default: return 'bg-solar-muted text-solar-primary'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-solar-success text-white'
      case 'INACTIVE': return 'bg-solar-danger text-white'
      case 'PENDING': return 'bg-solar-warning text-solar-dark'
      default: return 'bg-solar-muted text-solar-primary'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Acquiring personnel profile..." size="large" />
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Profile Lost</h1>
            <p className="text-solar-muted mt-1 font-medium italic">Signal termination or invalid reference.</p>
          </div>
        </div>
        <div className="solar-glass rounded-2xl p-12 text-center border-solar-danger/20">
          <p className="text-solar-danger font-black uppercase tracking-tight">{error || 'Node identification failed'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Personnel Profile</h1>
            <p className="text-solar-muted mt-1 font-medium italic">Complete overview of decentralized personnel node.</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/users/${id}/edit`)}
            className="sun-button px-6 py-2.5"
          >
            <div className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Modify Protocol</span>
            </div>
          </button>
          <button
            onClick={handleDelete}
            className="sun-button px-6 py-2.5 border-solar-danger/30 hover:border-solar-danger/50 shadow-solar-danger/10"
          >
            <div className="flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Terminate Access</span>
            </div>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="solar-glass rounded-3xl p-8 group relative overflow-hidden border-solar-panel/10">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-48 h-48 text-solar-yellow" />
        </div>
        <div className="flex items-center space-x-8 relative z-10">
          {/* Avatar */}
          <div className="relative group/avatar">
            <div className="w-28 h-28 bg-linear-to-br from-solar-panel to-solar-yellow rounded-2xl flex items-center justify-center shrink-0 shadow-2xl group-hover/avatar:scale-105 transition-transform duration-500 border border-solar-yellow/20">
              <span className="text-solar-bg text-4xl font-black">
                {user.first_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-solar-success rounded-lg border-4 border-solar-bg flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h2 className="text-3xl font-black text-solar-primary tracking-tighter uppercase italic">
                {user.first_name} {user.last_name}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/10 ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
              <span className={`px-4 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/10 ${getStatusBadgeColor(user.status)}`}>
                {user.status || 'ACTIVE'}
              </span>
            </div>
            <div className="mt-4 flex items-center text-solar-muted">
              <Mail className="w-4 h-4 mr-2 text-solar-yellow" />
              <span className="font-medium italic">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="solar-glass rounded-2xl p-6 border-solar-panel/10">
          <h3 className="text-xs font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline">
            <User className="w-4 h-4 mr-3 text-solar-yellow" />
            Personnel Identity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">First Name</span>
              <span className="text-sm font-black text-solar-primary uppercase">{user.first_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Last Name</span>
              <span className="text-sm font-black text-solar-primary uppercase">{user.last_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Email Hash</span>
              <span className="text-sm font-black text-solar-primary lowercase">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="solar-glass rounded-2xl p-6 border-solar-panel/10">
          <h3 className="text-xs font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline">
            <Shield className="w-4 h-4 mr-3 text-solar-yellow" />
            Security protocols
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Role Rank</span>
              <span className={`px-4 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/10 ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Current Status</span>
              <span className={`px-4 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/10 ${getStatusBadgeColor(user.status)}`}>
                {user.status || 'ACTIVE'}
              </span>
            </div>
            {user.admin_id && (
              <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
                <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Admin Nexus</span>
                <span className="text-xs font-black text-solar-primary uppercase tracking-tighter">{user.admin_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="solar-glass rounded-2xl p-6 border-solar-panel/10">
          <h3 className="text-xs font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline">
            <Calendar className="w-4 h-4 mr-3 text-solar-yellow" />
            Registry Chronology
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Initialization</span>
              <span className="text-sm font-black text-solar-primary uppercase">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Last Calibration</span>
              <span className="text-sm font-black text-solar-primary uppercase">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="solar-glass rounded-2xl p-6 border-solar-panel/10">
          <h3 className="text-xs font-black text-solar-primary mb-6 flex items-center tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline">
            <MapPin className="w-4 h-4 mr-3 text-solar-yellow" />
            Geospatial metadata
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Node ID</span>
              <span className="text-xs font-black text-solar-primary uppercase tracking-tighter">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-solar-border/30">
              <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Jurisdiction</span>
              <span className="text-sm font-black text-solar-primary uppercase">{user.region || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
