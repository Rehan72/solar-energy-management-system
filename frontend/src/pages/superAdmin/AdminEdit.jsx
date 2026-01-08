import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, ArrowLeft, User, Mail, MapPin, Lock, CheckCircle } from 'lucide-react'
import { getRequest, putRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'

export default function AdminEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    region: '',
    phone: '',
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const token = localStorage.getItem('token')

  const regions = [
    'Delhi',
    'Mumbai',
    'Patna',
    'Ahmedabad',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Jaipur'
  ]

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await getRequest(`/superadmin/admins/${id}`)
        const admin = response.data.admin || response.data
        setFormData({
          first_name: admin.first_name || '',
          last_name: admin.last_name || '',
          email: admin.email || '',
          password: '',
          confirmPassword: '',
          region: admin.region || '',
          phone: admin.phone || '',
          status: admin.status || 'ACTIVE'
        })
      } catch (error) {
        console.error('Failed to fetch admin:', error)
        setError('Failed to load admin details')
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [id, token])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) return 'First name is required'
    if (!formData.last_name.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (formData.password && formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        region: formData.region,
        status: formData.status
      }

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password
      }

      await putRequest(`/superadmin/admins/${id}`, updateData)
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/admins')
      }, 2000)
    } catch (error) {
      console.error('Failed to update admin:', error)
      setError(error.response?.data?.error || 'Failed to update admin. Please try again.')
    } finally {
      setSaving(false)
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
            <h1 className="text-2xl font-bold sun-glow-text">Edit Admin</h1>
            <p className="text-solar-muted mt-1">Update admin information</p>
          </div>
        </div>
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-solar-muted">Loading admin details...</p>
        </div>
      </div>
    )
  }

  if (success) {
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
            <h1 className="text-2xl font-bold sun-glow-text">Edit Admin</h1>
            <p className="text-solar-muted mt-1">Update admin information</p>
          </div>
        </div>

        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">Admin Updated Successfully!</h2>
          <p className="text-solar-muted">Redirecting to admins list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admins')}
          className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Edit Admin</h1>
          <p className="text-solar-muted mt-1">Update admin information</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-solar-card rounded-lg p-6 energy-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-solar-danger/20 border border-solar-danger text-solar-danger px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                placeholder="admin@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Assigned Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
              >
                <option value="">Select a region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                New Password (Optional)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-solar-yellow/10 border border-solar-yellow/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-solar-yellow mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-solar-yellow">Admin Permissions</h4>
                <p className="text-sm text-solar-muted mt-1">
                  This admin has access to manage users within their assigned region and view solar plant data.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admins')}
              className="px-6 py-3 bg-solar-card hover:bg-solar-panel/20 text-solar-primary font-semibold rounded-lg transition sun-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-solar-orange text-white font-semibold rounded-lg hover:bg-solar-orange/80 transition sun-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
