import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, ArrowLeft, User, Mail, Lock, CheckCircle } from 'lucide-react'
import { getRequest, putRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'

export default function EditUser() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    phone: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const token = localStorage.getItem('token')
  const currentUserRole = localStorage.getItem('role')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getRequest(`/superadmin/admins/${id}`)
        const user = response.data.user
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'USER',
          phone: user.phone || ''
        })
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setError('Failed to load user details')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
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
        role: formData.role
      }

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password
      }

      await putRequest(`/superadmin/admins/${id}`, updateData)
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/users')
      }, 2000)
    } catch (error) {
      console.error('Failed to update user:', error)
      setError(error.response?.data?.error || 'Failed to update user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getRoleOptions = () => {
    if (currentUserRole === 'SUPER_ADMIN') {
      return [
        { value: 'USER', label: 'User' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'SUPER_ADMIN', label: 'Super Admin' }
      ]
    } else if (currentUserRole === 'ADMIN') {
      return [
        { value: 'USER', label: 'User' }
      ]
    }
    return []
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
            <h1 className="text-2xl font-bold sun-glow-text">Edit User</h1>
            <p className="text-solar-muted mt-1">Update user information</p>
          </div>
        </div>
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-solar-muted">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (success) {
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
            <h1 className="text-2xl font-bold sun-glow-text">Edit User</h1>
            <p className="text-solar-muted mt-1">Update user information</p>
          </div>
        </div>

        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">User Updated Successfully!</h2>
          <p className="text-solar-muted">Redirecting to users list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Edit User</h1>
          <p className="text-solar-muted mt-1">Update user information</p>
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
                placeholder="user@example.com"
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

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
              >
                {getRoleOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-3 bg-solar-card hover:bg-solar-panel/20 text-solar-primary font-semibold rounded-lg transition sun-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-solar-dark border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
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
