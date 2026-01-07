import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Users, ArrowLeft, User, Mail, Calendar, Shield, MapPin, Edit, Trash2 } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080'

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
        const response = await axios.get(`${API_BASE_URL}/superadmin/admins/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
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
      await axios.delete(`${API_BASE_URL}/superadmin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/users')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">User Details</h1>
            <p className="text-solar-muted mt-1">View user information</p>
          </div>
        </div>
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-solar-muted">Loading user details...</p>
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
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">User Details</h1>
            <p className="text-solar-muted mt-1">View user information</p>
          </div>
        </div>
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <p className="text-solar-danger">{error || 'User not found'}</p>
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
            onClick={() => navigate('/users')}
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">User Details</h1>
            <p className="text-solar-muted mt-1">View user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/users/${id}/edit`)}
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

      {/* User Profile Card */}
      <div className="bg-solar-card rounded-lg p-6 energy-card">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-solar-yellow rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-solar-dark text-3xl font-bold">
              {user.first_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-solar-primary">
                {user.first_name} {user.last_name}
              </h2>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                {user.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-solar-muted">{user.email}</p>
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
              <span className="text-solar-primary font-medium">{user.first_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Last Name</span>
              <span className="text-solar-primary font-medium">{user.last_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Email</span>
              <span className="text-solar-primary font-medium">{user.email}</span>
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
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Status</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                {user.status || 'ACTIVE'}
              </span>
            </div>
            {user.admin_id && (
              <div className="flex justify-between items-center py-2 border-b border-solar-border">
                <span className="text-solar-muted">Admin ID</span>
                <span className="text-solar-primary font-medium text-sm">{user.admin_id}</span>
              </div>
            )}
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
                {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Updated At</span>
              <span className="text-solar-primary font-medium">
                {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-solar-card rounded-lg p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-solar-yellow" />
            Additional Info
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">User ID</span>
              <span className="text-solar-primary font-medium text-sm">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-solar-border">
              <span className="text-solar-muted">Region</span>
              <span className="text-solar-primary font-medium">{user.region || 'Not assigned'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
