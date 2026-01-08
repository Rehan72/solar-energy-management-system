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
  const token = localStorage.getItem('token')

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
  }, [id, token])

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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admins')}
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Admin Details</h1>
            <p className="text-solar-muted mt-1">View admin information</p>
          </div>
        </div>
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-solar-muted">Loading admin details...</p>
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
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Admin Details</h1>
            <p className="text-solar-muted mt-1">View admin information</p>
          </div>
        </div>
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <p className="text-solar-danger">{error || 'Admin not found'}</p>
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
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Admin Details</h1>
            <p className="text-solar-muted mt-1">View admin information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admins/${id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-danger text-white font-semibold rounded-lg hover:bg-solar-danger/80 transition sun-button"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-solar-card rounded-lg p-6 energy-card">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-solar-orange rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl font-bold">
              {admin.first_name?.charAt(0)?.toUpperCase() || admin.email?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>

          {/* Admin Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-solar-primary">
                {admin.first_name} {admin.last_name}
              </h2>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-solar-orange text-white">
                ADMIN
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(admin.status)}`}>
                {admin.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-solar-muted">{admin.email}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-solar-card rounded-lg p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-solar-yellow" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">First Name</span>
              <span className="text-solar-primary font-medium">{admin.first_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Last Name</span>
              <span className="text-solar-primary font-medium">{admin.last_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Email</span>
              <span className="text-solar-primary font-medium">{admin.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Phone</span>
              <span className="text-solar-primary font-medium">{admin.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-solar-card rounded-lg p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-solar-yellow" />
            Account Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Role</span>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-solar-orange text-white">
                ADMIN
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Status</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(admin.status)}`}>
                {admin.status || 'ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Region</span>
              <span className="flex items-center text-solar-primary font-medium">
                <MapPin className="w-4 h-4 mr-1 text-solar-orange" />
                {admin.region || 'Not assigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-solar-card rounded-lg p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-solar-yellow" />
            Timestamps
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Created At</span>
              <span className="text-solar-primary font-medium">
                {admin.created_at ? new Date(admin.created_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Updated At</span>
              <span className="text-solar-primary font-medium">
                {admin.updated_at ? new Date(admin.updated_at).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-solar-card rounded-lg p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-solar-yellow" />
            Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Admin ID</span>
              <span className="text-solar-primary font-medium text-sm">{admin.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Users Managed</span>
              <span className="text-solar-primary font-medium">{admin.users_count || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Plants Overseen</span>
              <span className="text-solar-primary font-medium">{admin.plants_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
