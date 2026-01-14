import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Shield, ArrowLeft, User, Mail, MapPin, Lock, CheckCircle, Edit, Eye, EyeOff } from 'lucide-react'
import LocationPicker from '../../components/LocationPicker'
import ProfileImageUpload from '../../components/ProfileImageUpload'
import SunLoader from '../../components/SunLoader'
import { notify } from '../../lib/toast'
import { getRequest, postRequest, putRequest } from '../../lib/apiService'

export default function CreateAdmin() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const viewParam = searchParams.get('view')
  
  const isEditMode = !!id && !viewParam
  const isViewMode = viewParam === 'true'

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    region: '',
    phone: '',
    profile_image: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ]

  // Fetch admin data for edit/view mode
  const fetchAdminData = useCallback(async () => {
    setInitialLoading(true)
    try {
      const response = await getRequest(`/superadmin/admins/${id}`)
      const admin = response.data.user || response.data
      setFormData({
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        email: admin.email || '',
        password: '',
        confirmPassword: '',
        region: admin.region || '',
        phone: admin.phone || '',
        profile_image: admin.profile_image || '',
        address_line1: admin.address_line1 || '',
        address_line2: admin.address_line2 || '',
        city: admin.city || '',
        state: admin.state || '',
        pincode: admin.pincode || '',
        latitude: admin.latitude || null,
        longitude: admin.longitude || null
      })
    } catch (error) {
      console.error('Failed to fetch admin:', error)
      setErrors({ submit: 'Failed to load admin data' })
    } finally {
      setInitialLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchAdminData()
    }
  }, [id, fetchAdminData])

  const handleChange = (field, value) => {
    if (isViewMode) return
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!isEditMode && !formData.password) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.region) newErrors.region = 'Region is required'
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address line 1 is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      if (isEditMode) {
        // Update existing admin
        await putRequest(`/superadmin/admins/${id}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: 'ADMIN',
          region: formData.region,
          phone: formData.phone,
          profile_image: formData.profile_image,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          latitude: formData.latitude,
          longitude: formData.longitude,
          ...(formData.password && { password: formData.password })
        })
        
        notify.success('Admin updated successfully!')
        setSuccess(true)
        setTimeout(() => {
          navigate('/admins')
        }, 2000)
      } else {
        // Create new admin
        await postRequest('/superadmin/admins', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: 'ADMIN',
          region: formData.region,
          phone: formData.phone,
          profile_image: formData.profile_image,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          latitude: formData.latitude,
          longitude: formData.longitude
        })
        
        notify.success('Admin created successfully!')
        setSuccess(true)
        setTimeout(() => {
          navigate('/admins')
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to save admin:', error)
      notify.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} admin. Please try again.`)
      setErrors({ submit: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} admin. Please try again.` })
    } finally {
      setLoading(false)
    }
  }

  // Get title and description based on mode
  const getPageInfo = () => {
    if (isViewMode) {
      return {
        title: 'View Admin',
        description: 'Admin details',
        icon: Eye,
        successTitle: 'Admin Details Viewed',
        buttonText: 'Viewed'
      }
    } else if (isEditMode) {
      return {
        title: 'Edit Admin',
        description: 'Update admin information',
        icon: Edit,
        successTitle: 'Admin Updated Successfully!',
        buttonText: 'Update Admin'
      }
    } else {
      return {
        title: 'Create Admin',
        description: 'Add a new regional administrator',
        icon: Shield,
        successTitle: 'Admin Created Successfully!',
        buttonText: 'Create Admin'
      }
    }
  }

  const pageInfo = getPageInfo()
  const IconComponent = pageInfo.icon

  if (initialLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/admins')}
            className="p-2 border border-solar-border rounded-lg hover:bg-solar-yellow/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Loading...</h1>
            <p className="text-solar-muted mt-1">Fetching admin data</p>
          </div>
        </div>
        <div className="solar-glass rounded-2xl p-8 w-full flex flex-col items-center justify-center h-64 relative">
          <SunLoader message="Loading admin data..." size="large" fullscreen={false} />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/admins')}
            className="p-2 border border-solar-border rounded-lg hover:bg-solar-yellow/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">{pageInfo.title}</h1>
            <p className="text-solar-muted mt-1">{pageInfo.description}</p>
          </div>
        </div>

        <div className="solar-glass rounded-2xl p-8 text-center w-full">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">{pageInfo.successTitle}</h2>
          <p className="text-solar-muted">Redirecting to admins list...</p>
        </div>
      </div>
    )
  }

  // Helper function to get input class based on mode
  const getInputClass = (fieldName) => {
    const baseClass = `solar-input ${errors[fieldName] ? 'border-solar-danger' : ''}`
    if (isViewMode) {
      return `${baseClass} opacity-70 cursor-not-allowed`
    }
    return baseClass
  }

  return (
    <div className="w-full relative">
      {/* Full page loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-solar-bg/80 z-50 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
          <SunLoader message={isEditMode ? 'Updating Admin...' : 'Creating Admin...'} size="large" fullscreen={false} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admins')}
          className="p-2 border border-solar-border rounded-lg hover:bg-solar-yellow/10 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text flex items-center">
            <IconComponent className="w-6 h-6 mr-2" />
            {pageInfo.title}
          </h1>
          <p className="text-solar-muted mt-1">{pageInfo.description}</p>
        </div>
      </div>

      {/* Form */}
      <div className="solar-glass rounded-2xl p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-800/20 border border-red-800 text-red-800 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Profile Image Upload - Read only for view mode */}
          {!isViewMode && (
            <ProfileImageUpload
              profileImagePreview={formData.profile_image}
              onImageUpload={(result, error) => {
                if (error) {
                  setErrors(prev => ({ ...prev, profile_image: error }))
                } else {
                  setFormData(prev => ({ ...prev, profile_image: result }))
                  setErrors(prev => ({ ...prev, profile_image: '' }))
                }
              }}
              error={errors.profile_image}
              variant="drag-drop"
              optional={true}
            />
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
                disabled={isViewMode}
                className={getInputClass('first_name')}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                placeholder="Enter first name"
              />
              {errors.first_name && <p className="text-sm text-red-800 mt-1">{errors.first_name}</p>}
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
                disabled={isViewMode}
                className={getInputClass('last_name')}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                placeholder="Enter last name"
              />
              {errors.last_name && <p className="text-sm text-red-800 mt-1">{errors.last_name}</p>}
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
                disabled={isViewMode}
                className={getInputClass('email')}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-sm text-red-800 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isViewMode}
                className={isViewMode ? 'solar-input opacity-70 cursor-not-allowed' : 'solar-input'}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
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
                disabled={isViewMode}
                className={isViewMode ? 'solar-input opacity-70 cursor-not-allowed' : `solar-input ${errors.region ? 'border-solar-danger' : ''}`}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
              >
                <option value="">Select a region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="text-sm text-red-800 mt-1">{errors.region}</p>}
            </div>

            {/* Password - Only show for create mode */}
            {!isViewMode && (
              <div className="relative">
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`solar-input pr-10 ${errors.password ? 'border-solar-danger' : ''}`}
                    style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                    placeholder={isEditMode ? "Leave blank to keep current password" : "Min. 6 characters"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-solar-muted hover:text-solar-primary"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-800 mt-1">{errors.password}</p>}
              </div>
            )}

            {/* Confirm Password - Only show for create mode */}
            {!isViewMode && (
              <div className="relative">
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`solar-input pr-10 ${errors.confirmPassword ? 'border-solar-danger' : ''}`}
                    style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-solar-muted hover:text-solar-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-800 mt-1">{errors.confirmPassword}</p>}
              </div>
            )}
          </div>

          {/* Address Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => handleChange('address_line1', e.target.value)}
                  disabled={isViewMode}
                  className={getInputClass('address_line1')}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Street address, house number"
                />
                {errors.address_line1 && <p className="text-sm text-red-800 mt-1">{errors.address_line1}</p>}
              </div>

              {/* Address Line 2 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => handleChange('address_line2', e.target.value)}
                  disabled={isViewMode}
                  className={isViewMode ? 'solar-input opacity-70 cursor-not-allowed' : 'solar-input'}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Apartment, suite, landmark (optional)"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={isViewMode}
                  className={getInputClass('city')}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Enter city"
                />
                {errors.city && <p className="text-sm text-red-800 mt-1">{errors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={isViewMode}
                  className={isViewMode ? 'solar-input opacity-70 cursor-not-allowed' : `solar-input ${errors.state ? 'border-solar-danger' : ''}`}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                >
                  <option value="">Select a state</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-sm text-red-800 mt-1">{errors.state}</p>}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  disabled={isViewMode}
                  className={getInputClass('pincode')}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                {errors.pincode && <p className="text-sm text-red-800 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Location Picker Component */}
          {!isViewMode && (
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={({ latitude, longitude }) => {
                setFormData(prev => ({ ...prev, latitude, longitude }))
              }}
              placeholder="Search for admin location (e.g., Delhi, India)"
            />
          )}

          {/* Role Info */}
          <div className="bg-solar-yellow/10 border border-solar-yellow/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-solar-yellow mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-solar-yellow">Admin Permissions</h4>
                <p className="text-sm text-solar-muted mt-1">
                  {isViewMode 
                    ? 'This admin has access to manage users within their assigned region and view solar plant data.'
                    : 'This admin will have access to manage users within their assigned region and view solar plant data.'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!isViewMode && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admins')}
                className="px-6 py-3 border border-solar-border text-solar-muted rounded-xl hover:bg-solar-yellow/10 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="sun-button"
              >
                {loading ? (
                  <SunLoader message={isEditMode ? 'Updating...' : 'Creating...'} fullscreen={false} />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>{pageInfo.buttonText}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* View mode back button */}
          {isViewMode && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admins')}
                className="px-8 py-3 sun-button"
              >
                Back to Admins
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
