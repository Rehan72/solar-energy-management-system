import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, ArrowLeft, User, Mail, Lock, CheckCircle, Phone, MapPin, Eye, EyeOff, Shield } from 'lucide-react'
import { Button } from '../../components/ui/button'
import LocationPicker from '../../components/LocationPicker'
import { getRequest, putRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'

export default function EditUser() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic details
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    region: '',
    latitude: null,
    longitude: '',
    admin_id: '',
    installer_id: '',

    // Solar-specific
    installation_status: 'NOT_INSTALLED',
    property_type: 'RESIDENTIAL',
    avg_monthly_bill: '',
    roof_area_sqft: '',
    connection_type: 'SINGLE_PHASE',
    subsidy_interest: false,

    // Installed user fields
    plant_capacity_kw: '',
    net_metering: false,
    inverter_brand: '',
    discom_name: '',
    consumer_number: '',
    subsidy_applied: false,
    subsidy_status: '',
    scheme_name: '',
    application_id: ''
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
        const response = await getRequest(`/admin/users/${id}`)
        const user = response.data.user
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'USER',
          phone: user.phone || '',
          address_line1: user.address_line1 || '',
          address_line2: user.address_line2 || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          region: user.region || '',
          latitude: user.latitude || null,
          longitude: user.longitude || null,
          admin_id: user.admin_id || '',
          installer_id: user.installer_id || '',
          installation_status: user.installation_status || 'NOT_INSTALLED',
          property_type: user.property_type || 'RESIDENTIAL',
          avg_monthly_bill: user.avg_monthly_bill || '',
          roof_area_sqft: user.roof_area_sqft || '',
          connection_type: user.connection_type || 'SINGLE_PHASE',
          subsidy_interest: user.subsidy_interest || false,
          plant_capacity_kw: user.plant_capacity_kw || '',
          net_metering: user.net_metering || false,
          inverter_brand: user.inverter_brand || '',
          discom_name: user.discom_name || '',
          consumer_number: user.consumer_number || '',
          subsidy_applied: user.subsidy_applied || false,
          subsidy_status: user.subsidy_status || '',
          scheme_name: user.scheme_name || '',
          application_id: user.application_id || ''
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

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [admins, setAdmins] = useState([])
  const [installers, setInstallers] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [filteredInstallers, setFilteredInstallers] = useState([])
  const adminsLoadedRef = useRef(false)

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

  // Fetch admins on mount
  useEffect(() => {
    const fetchAdmins = async () => {
      if (currentUserRole !== 'SUPER_ADMIN') {
        adminsLoadedRef.current = true
        return
      }
      try {
        const response = await getRequest('/superadmin/admins')
        const adminsData = (response.data.admins || []).map(admin => ({
          ...admin,
          name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
        }))
        setAdmins(adminsData)
        // Filter admins based on user's region if user data already loaded
        if (formData.region) {
          const filtered = adminsData.filter(admin => admin.region === formData.region)
          setFilteredAdmins(filtered)
        } else {
          setFilteredAdmins(adminsData)
        }
        adminsLoadedRef.current = true
      } catch (error) {
        console.error('Failed to fetch admins:', error)
      }
    }
    fetchAdmins()

    const fetchInstallers = async () => {
      try {
        const response = await getRequest('/admin/installers')
        const installersData = (response.data.installers || []).map(inst => ({
          ...inst,
          name: `${inst.first_name || ''} ${inst.last_name || ''}`.trim()
        }))
        setInstallers(installersData)
        if (formData.region) {
          setFilteredInstallers(installersData.filter(i => i.region === formData.region))
        } else {
          setFilteredInstallers(installersData)
        }
      } catch (error) {
        console.error('Failed to fetch installers:', error)
      }
    }
    fetchInstallers()
  }, [])

  // Re-filter admins when admins are first loaded and user has a region
  useEffect(() => {
    if (adminsLoadedRef.current && formData.region && admins.length > 0) {
      const filtered = admins.filter(admin => admin.region === formData.region)
      setFilteredAdmins(filtered)
    }
  }, [admins, formData.region])

  // Filter admins when region changes (only after initial load)
  useEffect(() => {
    if (formData.region && admins.length > 0) {
      const filtered = admins.filter(admin => admin.region === formData.region)
      setFilteredAdmins(filtered)
    } else if (admins.length > 0) {
      setFilteredAdmins(admins)
    }

    if (formData.region && installers.length > 0) {
      setFilteredInstallers(installers.filter(i => i.region === formData.region))
    } else if (installers.length > 0) {
      setFilteredInstallers(installers)
    }

    // Only reset choices when region actually changes (not on initial load)
    if (adminsLoadedRef.current && formData.region === '') {
      if (formData.admin_id) setFormData(prev => ({ ...prev, admin_id: '' }))
      if (formData.installer_id) setFormData(prev => ({ ...prev, installer_id: '' }))
    }
  }, [formData.region, admins, installers])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!formData.first_name.trim()) return 'First name is required'
    if (!formData.last_name.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (formData.password && formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const validateStep2 = () => {
    if (formData.installation_status === "NOT_INSTALLED" || formData.installation_status === "INSTALLATION_PLANNED") {
      return formData.avg_monthly_bill && parseFloat(formData.avg_monthly_bill) > 0
    } else if (formData.installation_status === "INSTALLED") {
      return formData.plant_capacity_kw && parseFloat(formData.plant_capacity_kw) > 0
    }
    return true
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1 && !validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = (e) => {
    e.preventDefault()
    setStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateStep1()
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
        role: formData.role,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        region: formData.region,
        latitude: formData.latitude,
        longitude: formData.longitude,
        admin_id: formData.admin_id,
        installer_id: formData.installer_id,
        installation_status: formData.installation_status,
        property_type: formData.property_type,
        avg_monthly_bill: parseFloat(formData.avg_monthly_bill) || 0,
        roof_area_sqft: parseFloat(formData.roof_area_sqft) || 0,
        connection_type: formData.connection_type,
        subsidy_interest: formData.subsidy_interest,
        plant_capacity_kw: parseFloat(formData.plant_capacity_kw) || 0,
        net_metering: formData.net_metering,
        inverter_brand: formData.inverter_brand,
        discom_name: formData.discom_name,
        consumer_number: formData.consumer_number,
        subsidy_applied: formData.subsidy_applied,
        subsidy_status: formData.subsidy_status,
        scheme_name: formData.scheme_name,
        application_id: formData.application_id
      }

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password
      }

      const endpoint = currentUserRole === 'SUPER_ADMIN' 
        ? `/superadmin/admins/${id}` 
        : `/admin/users/${id}`

      await putRequest(endpoint, updateData)

      setSuccess(true)
      notify.success('User updated successfully!')
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
      {saving && <SunLoader message="Saving changes..." />}
      {/* Progress Steps */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s
              ? "bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark"
              : "bg-gray-300 text-gray-500"
              }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-1 ${step > s ? "bg-solar-yellow" : "bg-gray-300"}`} />}
          </div>
        ))}
      </div>

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
          <p className="text-solar-muted mt-1">Update user information step by step</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-solar-card rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-solar-danger/20 border border-solar-danger text-solar-danger px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-solar-primary">Basic Information</h3>

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
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
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
                {/* <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
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
                </div> */}

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    New Password (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-solar-muted hover:text-solar-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirm New Password (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-solar-muted hover:text-solar-primary"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons for Step 1 */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button"
                >
                  Next: Installation Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Installation Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-solar-primary">Installation Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Installation Status */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Installation Status
                  </label>
                  <select
                    value={formData.installation_status}
                    onChange={(e) => handleChange('installation_status', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
                  >
                    <option value="NOT_INSTALLED">Not Installed</option>
                    <option value="INSTALLATION_PLANNED">Installation Planned</option>
                    <option value="INSTALLED">Installed</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Property Type
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleChange('property_type', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                    <option value="AGRICULTURAL">Agricultural</option>
                  </select>
                </div>

                {/* Average Monthly Bill */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Average Monthly Bill (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.avg_monthly_bill}
                    onChange={(e) => handleChange('avg_monthly_bill', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                    placeholder="Enter average monthly bill"
                    min="0"
                  />
                </div>

                {/* Roof Area */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Roof Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={formData.roof_area_sqft}
                    onChange={(e) => handleChange('roof_area_sqft', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                    placeholder="Enter roof area"
                    min="0"
                  />
                </div>

                {/* Connection Type */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Connection Type
                  </label>
                  <select
                    value={formData.connection_type}
                    onChange={(e) => handleChange('connection_type', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
                  >
                    <option value="SINGLE_PHASE">Single Phase</option>
                    <option value="THREE_PHASE">Three Phase</option>
                  </select>
                </div>

                {/* Subsidy Interest */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subsidy_interest"
                    checked={formData.subsidy_interest}
                    onChange={(e) => handleChange('subsidy_interest', e.target.checked)}
                    className="w-5 h-5 rounded border-solar-border text-solar-yellow focus:ring-solar-yellow"
                  />
                  <label htmlFor="subsidy_interest" className="ml-3 text-solar-primary">
                    Interested in Government Subsidy
                  </label>
                </div>
              </div>

              {/* Fields for Installed Users */}
              {formData.installation_status === 'INSTALLED' && (
                <div className="mt-6 p-4 bg-solar-panel/20 rounded-lg border border-solar-border">
                  <h4 className="text-md font-semibold text-solar-primary mb-4">Installed Plant Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plant Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Plant Capacity (kW)
                      </label>
                      <input
                        type="number"
                        value={formData.plant_capacity_kw}
                        onChange={(e) => handleChange('plant_capacity_kw', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                        placeholder="Enter plant capacity"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Net Metering */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="net_metering"
                        checked={formData.net_metering}
                        onChange={(e) => handleChange('net_metering', e.target.checked)}
                        className="w-5 h-5 rounded border-solar-border text-solar-yellow focus:ring-solar-yellow"
                      />
                      <label htmlFor="net_metering" className="ml-3 text-solar-primary">
                        Net Metering Enabled
                      </label>
                    </div>

                    {/* Inverter Brand */}
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Inverter Brand
                      </label>
                      <input
                        type="text"
                        value={formData.inverter_brand}
                        onChange={(e) => handleChange('inverter_brand', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                        placeholder="Enter inverter brand"
                      />
                    </div>

                    {/* DISCOM Name */}
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        DISCOM Name
                      </label>
                      <input
                        type="text"
                        value={formData.discom_name}
                        onChange={(e) => handleChange('discom_name', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                        placeholder="Enter DISCOM name"
                      />
                    </div>

                    {/* Consumer Number */}
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Consumer Number
                      </label>
                      <input
                        type="text"
                        value={formData.consumer_number}
                        onChange={(e) => handleChange('consumer_number', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                        placeholder="Enter consumer number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons for Step 2 */}
              <div className="flex justify-between space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 bg-solar-card hover:bg-solar-panel/20 text-solar-primary font-semibold rounded-lg transition sun-button"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button"
                >
                  Next: Location & Admin
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location & Admin */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-solar-primary">Location & Admin Assignment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Region
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

                {/* Assigned Admin */}
                {currentUserRole === 'SUPER_ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-solar-primary mb-2">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Assigned Admin
                    </label>
                    <select
                      value={formData.admin_id}
                      onChange={(e) => handleChange('admin_id', e.target.value)}
                      className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
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
                )}

                {/* Assigned Installer */}
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Assigned Installer
                  </label>
                  <select
                    value={formData.installer_id}
                    onChange={(e) => handleChange('installer_id', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
                    disabled={!formData.region}
                  >
                    <option value="">Select an installer</option>
                    {filteredInstallers.length > 0 ? (
                      filteredInstallers.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.email})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No installers found in this region</option>
                    )}
                  </select>
                  {!formData.region && (
                    <p className="text-sm text-solar-muted mt-1">Select a region first to see available installers</p>
                  )}
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
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
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
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
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
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
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow transition"
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
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow transition"
                    placeholder="Enter pincode"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-solar-primary mb-2">
                  Location
                </label>
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={({ latitude, longitude }) => {
                    handleChange('latitude', latitude)
                    handleChange('longitude', longitude)
                  }}
                  placeholder="Search for location"
                />
              </div>

              {/* Navigation Buttons for Step 3 */}
              <div className="flex justify-between space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 bg-solar-card hover:bg-solar-panel/20 text-solar-primary font-semibold rounded-lg transition sun-button"
                >
                  Back
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
                      <span>Update User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
