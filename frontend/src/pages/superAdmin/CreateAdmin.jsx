import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Shield, ArrowLeft, User, Mail, MapPin, Lock, CheckCircle, Camera, Upload, Navigation } from 'lucide-react'
import LocationPicker from '../../components/LocationPicker'
import ProfileImageUpload from '../../components/ProfileImageUpload'
import SunLoader from '../../components/SunLoader'

const API_BASE_URL = 'http://localhost:8080'

export default function CreateAdmin() {
  const navigate = useNavigate()
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
    // Clear error when user starts typing
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
      await axios.post(`${API_BASE_URL}/superadmin/admins`, {
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
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/admins')
      }, 2000)
    } catch (error) {
      console.error('Failed to create admin:', error)
      setErrors({ submit: error.response?.data?.error || 'Failed to create admin. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/admins')}
            className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold sun-glow-text">Create Admin</h1>
            <p className="text-solar-muted mt-1">Add a new regional administrator</p>
          </div>
        </div>

        <div className="bg-solar-card rounded-lg p-8 text-center w-full">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">Admin Created Successfully!</h2>
          <p className="text-solar-muted">Redirecting to admins list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admins')}
          className="p-2 bg-solar-card rounded-lg hover:bg-solar-panel/20"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Create Admin</h1>
          <p className="text-solar-muted mt-1">Add a new regional administrator</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-solar-card rounded-lg p-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-800/20 border border-red-800 text-red-800 px-4 py-3 rounded-lg">
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.password ? 'border-solar-danger' : 'border-solar-yellow'}`}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                placeholder="Min. 6 characters"
              />
              {errors.password && <p className="text-sm text-red-800 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-solar-danger' : 'border-solar-yellow'}`}
                style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-sm text-red-800 mt-1">{errors.confirmPassword}</p>}
            </div>
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
                  className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.address_line1 ? 'border-solar-danger' : 'border-solar-yellow'}`}
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
                  className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.city ? 'border-solar-danger' : 'border-solar-yellow'}`}
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
                  className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary focus:outline-none focus:ring-2 ${errors.state ? 'border-solar-danger' : 'border-solar-yellow'}`}
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
                  className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.pincode ? 'border-solar-danger' : 'border-solar-yellow'}`}
                  style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                {errors.pincode && <p className="text-sm text-red-800 mt-1">{errors.pincode}</p>}
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
            placeholder="Search for admin location (e.g., Delhi, India)"
          />

          {/* Role Info */}
          <div className="bg-solar-yellow/10 border border-solar-yellow/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-solar-yellow mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-solar-yellow">Admin Permissions</h4>
                <p className="text-sm text-solar-muted mt-1">
                  This admin will have access to manage users within their assigned region and view solar plant data.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admins')}
              className="px-6 py-3 bg-solar-card hover:bg-solar-panel/20 text-solar-primary font-semibold rounded-lg sun-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-solar-orange text-white font-semibold rounded-lg hover:bg-solar-orange/80 sun-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <SunLoader message="Creating Admin..." />
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Create Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
