import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, User, Mail, Lock, CheckCircle, Phone, MapPin, Eye, EyeOff, Shield } from 'lucide-react'
import LocationPicker from '../../components/LocationPicker'
import ProfileImageUpload from '../../components/ProfileImageUpload'
import { postRequest, getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'

export default function CreateUser() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profile_image: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    region: '',
    latitude: null,
    longitude: null,
    admin_id: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])

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

  // Fetch admins on mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await getRequest('/superadmin/admins')
        const adminsData = (response.data.admins || []).map(admin => ({
          ...admin,
          name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
        }))
        setAdmins(adminsData)
        setFilteredAdmins(adminsData)
      } catch (error) {
        console.error('Failed to fetch admins:', error)
      }
    }
    fetchAdmins()
  }, [])

  // Filter admins when region changes
  useEffect(() => {
    if (formData.region) {
      const filtered = admins.filter(admin => admin.region === formData.region)
      setFilteredAdmins(filtered)
    } else {
      setFilteredAdmins(admins)
    }
    // Reset admin selection when region changes
    setFormData(prev => ({ ...prev, admin_id: '' }))
  }, [formData.region, admins])

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ]

  const handleChange = (field, value) => {
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
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
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
      await postRequest('/admin/users', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: 'USER',
        phone: formData.phone,
        profile_image: formData.profile_image,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        region: formData.region,
        latitude: formData.latitude,
        longitude: formData.longitude,
        admin_id: formData.admin_id
      })
      
      setSuccess(true)
      notify.success('User created successfully!')
      setTimeout(() => {
        navigate('/users')
      }, 2000)
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create user. Please try again.'
      setErrors({ submit: errorMsg })
      notify.error(errorMsg)
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold sun-glow-text">Create User</h1>
            <p className="text-solar-muted mt-1">Add a new user to the platform</p>
          </div>
        </div>

        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">User Created Successfully!</h2>
          <p className="text-solar-muted mb-6">What would you like to do next?</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button"
            >
              <User className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-solar-card border border-solar-yellow text-solar-primary font-semibold rounded-lg hover:bg-solar-panel/20 transition sun-button"
            >
              <Users className="w-5 h-5" />
              <span>View Profile</span>
            </button>
          </div>
          
          <p className="text-solar-muted mt-6 text-sm">Redirecting to dashboard automatically...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading && <SunLoader message="Creating user..." />}
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Create User</h1>
          <p className="text-solar-muted mt-1">Add a new user to the platform</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-solar-card rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-solar-danger/20 border border-solar-danger text-solar-danger px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Profile Image Upload */}
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

          {/* Basic Information */}
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
                className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.first_name ? 'border-solar-danger' : 'border-solar-yellow'}`}
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
                className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.last_name ? 'border-solar-danger' : 'border-solar-yellow'}`}
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
                className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.email ? 'border-solar-danger' : 'border-solar-yellow'}`}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                placeholder="user@example.com"
              />
              {errors.email && <p className="text-sm text-red-800 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
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
                className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary focus:outline-none focus:ring-2 ${errors.region ? 'border-solar-danger' : 'border-solar-yellow'}`}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
              >
                <option value="">Select a region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="text-sm text-red-800 mt-1">{errors.region}</p>}
            </div>

            {/* Select Admin */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Assigned Admin
              </label>
              <select
                value={formData.admin_id}
                onChange={(e) => handleChange('admin_id', e.target.value)}
                className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                disabled={!formData.region}
              >
                <option value="">Select an admin</option>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No admins found in this region</option>
                )}
              </select>
              {!formData.region && (
                <p className="text-sm text-solar-muted mt-1">Select a region first to see available admins</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 pr-10 ${errors.password ? 'border-solar-danger' : 'border-solar-yellow'}`}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password */}
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
                  className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 pr-10 ${errors.confirmPassword ? 'border-solar-danger' : 'border-solar-yellow'}`}
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
          </div>

          {/* Address Information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-solar-yellow" />
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
                  className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Street address, house number"
                />
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
                  className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
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
                  className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Enter city"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                >
                  <option value="">Select a state</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
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
                  className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Location Picker Component */}
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={({ latitude, longitude }) => {
              setFormData(prev => ({ ...prev, latitude, longitude }))
            }}
            placeholder="Search for user location (e.g., Delhi, India)"
          />

          {/* Role Info */}
          <div className="bg-solar-success/10 border border-solar-success/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-solar-success mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-solar-success">User Permissions</h4>
                <p className="text-sm text-solar-muted mt-1">
                  This user will have standard access to view solar plant data and their own dashboard.
                </p>
              </div>
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
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-solar-dark border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
