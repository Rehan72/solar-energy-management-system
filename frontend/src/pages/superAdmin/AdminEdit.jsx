import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, ArrowLeft, User, Mail, MapPin, Lock, CheckCircle, Save, Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Synchronizing admin credentials..." size="large" fullscreen={false} />
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
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Update Protocol Verified</h1>
            <p className="text-solar-muted mt-1">Registry synchronization complete</p>
          </div>
        </div>

        <div className="solar-glass rounded-2xl p-12 text-center border-solar-success/20">
          <div className="w-20 h-20 bg-solar-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-solar-success/20">
            <CheckCircle className="w-10 h-10 text-solar-success animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-solar-primary mb-3 uppercase tracking-tight">Admin Node Optimized</h2>
          <p className="text-solar-muted font-medium">Telemetry data successfully propagated to the central registry.</p>
          <div className="mt-8 flex justify-center items-center space-x-2 text-solar-muted">
            <div className="w-2 h-2 bg-solar-yellow rounded-full animate-bounce"></div>
            <span className="text-xs font-bold uppercase tracking-widest">Redirecting to Fleet Overview...</span>
          </div>
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
          className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Edit Admin Intelligence</h1>
          <p className="text-solar-muted mt-1 font-medium">Modify personnel access parameters and regional jurisdiction.</p>
        </div>
      </div>

      {/* Form */}
      <div className="solar-glass rounded-2xl p-8 group relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="bg-solar-danger/10 border border-solar-danger/30 text-solar-danger px-6 py-4 rounded-xl flex items-center space-x-3 animate-shake">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-tight">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <User className="w-3.5 h-3.5 mr-2 text-solar-yellow" />
                First Name Designation
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="solar-input"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <User className="w-3.5 h-3.5 mr-2 text-solar-yellow" />
                Last Name Designation
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="solar-input"
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <Mail className="w-3.5 h-3.5 mr-2 text-solar-panel" />
                Primary Communication Link
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="solar-input"
                placeholder="admin@telemetry.io"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <User className="w-3.5 h-3.5 mr-2 text-solar-success" />
                Personnel Contact (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="solar-input"
                placeholder="+91 000 000 0000"
              />
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-2 text-solar-orange" />
                Regional Jurisdiction
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="solar-input"
              >
                <option value="">Select operational sector</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <Shield className="w-3.5 h-3.5 mr-2 text-solar-panel" />
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="solar-input"
              >
                <option value="ACTIVE">System Active</option>
                <option value="INACTIVE">Node Offline</option>
                <option value="PENDING">Awaiting Sync</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <Lock className="w-3.5 h-3.5 mr-2 text-solar-danger" />
                Credential Update (Optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="solar-input pr-10"
                  placeholder="Leave blank to maintain current"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-solar-muted hover:text-solar-yellow transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-solar-muted uppercase tracking-widest flex items-center">
                <Lock className="w-3.5 h-3.5 mr-2 text-solar-danger" />
                Verify Protocol Change
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="solar-input pr-10"
                  placeholder="Confirm new credentials"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-solar-muted hover:text-solar-yellow transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-solar-yellow/5 border border-solar-yellow/20 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-12 h-12 text-solar-yellow" />
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-solar-yellow/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-solar-yellow" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-solar-yellow uppercase tracking-widest mb-1">Privilege Intelligence Card</h4>
                <p className="text-xs text-solar-muted font-medium leading-relaxed">
                  This administrative node is authorized for full regional management. Modifying these parameters affects infrastructure oversight and personnel access within the assigned sector.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-6 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admins')}
              className="px-8 py-3 text-solar-muted font-black uppercase tracking-widest text-xs hover:text-solar-primary transition-all underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
            >
              Abort Update
            </button>
            <button
              type="submit"
              disabled={saving}
              className="sun-button px-10 py-3"
            >
              <div className="flex items-center space-x-2">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Propagate Changes</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
