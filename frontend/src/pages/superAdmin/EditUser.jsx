import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, ArrowLeft, User, Mail, Lock, CheckCircle, Phone, MapPin, Eye, EyeOff, Shield, Zap, ZapIcon } from 'lucide-react'
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

  const fetchAdmins = useCallback(async () => {
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
  }, [currentUserRole, formData.region])

  const fetchInstallers = useCallback(async () => {
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
  }, [formData.region])

  // Fetch admins on mount
  useEffect(() => {
    fetchAdmins()
    fetchInstallers()
  }, [fetchAdmins, fetchInstallers])

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
  }, [formData.region, admins, installers, formData.admin_id, formData.installer_id])

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



  if (loading) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        {/* Full page loading overlay */}
        <div className="absolute inset-0 bg-solar-bg/80 z-50 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
          <SunLoader message="Synchronizing user data..." size="large" fullscreen={false} />
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
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Registry Updated</h1>
            <p className="text-solar-muted mt-1 font-medium italic">Synchronizing fleet records...</p>
          </div>
        </div>

        <div className="solar-glass rounded-3xl p-12 text-center border-solar-success/20 group">
          <div className="w-20 h-20 bg-solar-success/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-solar-success/20 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle className="w-10 h-10 text-solar-success animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-solar-primary mb-3 uppercase tracking-tight">Personnel Optimized</h2>
          <p className="text-solar-muted font-medium italic">Telemetry data successfully propagated to the central registry.</p>
          <div className="mt-8 flex justify-center items-center space-x-2 text-solar-muted">
            <div className="w-2 h-2 bg-solar-yellow rounded-full animate-bounce"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Redirecting to command center...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {saving && <SunLoader message="Propagating registry changes..." />}
      
      {/* Progress Steps */}
      <div className="flex justify-center items-center max-w-2xl mx-auto mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`relative shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border ${step >= s
              ? "bg-linear-to-br from-solar-panel to-solar-yellow text-solar-dark border-solar-yellow shadow-[0_0_20px_rgba(255,209,102,0.3)]"
              : "solar-glass text-solar-muted border-solar-border/30 opacity-40"
              }`}>
              {s}
              {step === s && <div className="absolute -inset-1 bg-solar-yellow/20 rounded-2xl blur-sm animate-pulse"></div>}
            </div>
            {s < 3 && (
              <div className="flex-1 mx-4 relative">
                <div className="h-0.5 w-full bg-solar-border/20 rounded-full" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step > s ? "100%" : "0%" }}
                  className="absolute inset-0 h-0.5 bg-linear-to-r from-solar-panel to-solar-yellow rounded-full shadow-[0_0_10px_rgba(255,209,102,0.5)]" 
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
        >
          <ArrowLeft className="w-5 h-5 text-solar-primary" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Modify Personnel Node</h1>
          <p className="text-solar-muted mt-1 font-medium italic">Calibrating system access and jurisdictional parameters.</p>
        </div>
      </div>

      {/* Form */}
      <div className="solar-glass rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-32 h-32 text-solar-yellow" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="bg-solar-danger/10 border border-solar-danger/30 text-solar-danger px-6 py-4 rounded-xl flex items-center space-x-3 animate-shake">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-tight">{error}</span>
            </div>
          )}

          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-xl font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
                <User className="w-5 h-5 mr-3 text-solar-yellow" />
                Identity parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Given Name Designation
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
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Surname Reference
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
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Digital Signature (Email)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="solar-input"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Comm-Link (Phone)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="solar-input"
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
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Access Protocol (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="solar-input pr-12"
                      placeholder="Rotate access key..."
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
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Verify Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="solar-input pr-12"
                      placeholder="Confirm new key..."
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
              <div className="flex justify-end pt-8">
                <button
                  type="button"
                  onClick={handleNext}
                  className="sun-button px-10 py-3"
                >
                  <div className="flex items-center space-x-2">
                    <span>Analyze Installation Data</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Installation Details */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-xl font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
                <ZapIcon className="w-5 h-5 mr-3 text-solar-yellow" />
                Infrastructure Analytics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Installation Status */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Node Deployment Status
                  </label>
                  <select
                    value={formData.installation_status}
                    onChange={(e) => handleChange('installation_status', e.target.value)}
                    className="solar-input"
                  >
                    <option value="NOT_INSTALLED">Not Yet Deployed</option>
                    <option value="INSTALLATION_PLANNED">Deployment Imminent</option>
                    <option value="INSTALLED">Synchronized (Installed)</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Structural Classification
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleChange('property_type', e.target.value)}
                    className="solar-input"
                  >
                    <option value="RESIDENTIAL">Residential Node</option>
                    <option value="COMMERCIAL">Commercial Array</option>
                    <option value="INDUSTRIAL">Industrial Grid</option>
                    <option value="AGRICULTURAL">Agricultural Plot</option>
                  </select>
                </div>

                {/* Average Monthly Bill */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Mean Energy Expenditure (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.avg_monthly_bill}
                    onChange={(e) => handleChange('avg_monthly_bill', e.target.value)}
                    className="solar-input"
                    placeholder="Mean monthly usage..."
                    min="0"
                  />
                </div>

                {/* Roof Area */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Surface Aperture (SQ FT)
                  </label>
                  <input
                    type="number"
                    value={formData.roof_area_sqft}
                    onChange={(e) => handleChange('roof_area_sqft', e.target.value)}
                    className="solar-input"
                    placeholder="Verified roof area..."
                    min="0"
                  />
                </div>

                {/* Connection Type */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Grid Phase Topology
                  </label>
                  <select
                    value={formData.connection_type}
                    onChange={(e) => handleChange('connection_type', e.target.value)}
                    className="solar-input"
                  >
                    <option value="SINGLE_PHASE">Monophase (Single)</option>
                    <option value="THREE_PHASE">Triphase (Three)</option>
                  </select>
                </div>

                {/* Subsidy Interest */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subsidy_interest"
                    checked={formData.subsidy_interest}
                    onChange={(e) => handleChange('subsidy_interest', e.target.checked)}
                    className="w-5 h-5 rounded-lg border-solar-border bg-solar-night/50 text-solar-yellow focus:ring-solar-yellow/50 transition-all cursor-pointer"
                  />
                  <label htmlFor="subsidy_interest" className="ml-3 text-xs font-black text-solar-muted uppercase tracking-widest cursor-pointer hover:text-solar-primary transition-colors">
                    Registry Subsidy Intent Verified
                  </label>
                </div>
              </div>

              {/* Fields for Installed Users */}
              {formData.installation_status === 'INSTALLED' && (
                <div className="mt-8 p-8 solar-glass rounded-2xl border border-solar-yellow/20 relative overflow-hidden group/installed">
                  <div className="absolute inset-0 bg-solar-yellow/[0.02] pointer-events-none"></div>
                  <h4 className="text-sm font-black text-solar-yellow mb-6 uppercase tracking-[0.2em] flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Synchronized Plant Telemetry
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plant Capacity */}
                    <div>
                      <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                        Maximum Power Flux (kW)
                      </label>
                      <input
                        type="number"
                        value={formData.plant_capacity_kw}
                        onChange={(e) => handleChange('plant_capacity_kw', e.target.value)}
                        className="solar-input border-solar-yellow/10"
                        placeholder="Installed capacity..."
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
                        className="w-5 h-5 rounded-lg border-solar-border bg-solar-night/50 text-solar-success focus:ring-solar-success/50 transition-all cursor-pointer"
                      />
                      <label htmlFor="net_metering" className="ml-3 text-xs font-black text-solar-muted uppercase tracking-widest cursor-pointer hover:text-solar-primary transition-colors">
                        Bidirectional Flow (Net Meter) Enabled
                      </label>
                    </div>

                    {/* Inverter Brand */}
                    <div>
                      <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                        Conversion Unit Brand (Inverter)
                      </label>
                      <input
                        type="text"
                        value={formData.inverter_brand}
                        onChange={(e) => handleChange('inverter_brand', e.target.value)}
                        className="solar-input border-solar-yellow/10"
                        placeholder="Inverter specification..."
                      />
                    </div>

                    {/* DISCOM Name */}
                    <div>
                      <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                        Grid Administrator (DISCOM)
                      </label>
                      <input
                        type="text"
                        value={formData.discom_name}
                        onChange={(e) => handleChange('discom_name', e.target.value)}
                        className="solar-input border-solar-yellow/10"
                        placeholder="Local DISCOM identity..."
                      />
                    </div>

                    {/* Consumer Number */}
                    <div>
                      <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                        End-Point ID (Consumer No.)
                      </label>
                      <input
                        type="text"
                        value={formData.consumer_number}
                        onChange={(e) => handleChange('consumer_number', e.target.value)}
                        className="solar-input border-solar-yellow/10"
                        placeholder="Grid consumer reference..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons for Step 2 */}
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-10 py-3 text-solar-muted font-black uppercase tracking-widest text-xs hover:text-solar-primary transition-all underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
                >
                  Return to Identity
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="sun-button px-10 py-3"
                >
                  <div className="flex items-center space-x-2">
                    <span>Finalize Jurisdictional Data</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location & Admin */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-xl font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
                <MapPin className="w-5 h-5 mr-3 text-solar-orange" />
                Geospatial Assignment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Region */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Operational Sector (Region)
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="solar-input"
                  >
                    <option value="">Select jurisdiction...</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned Admin */}
                {currentUserRole === 'SUPER_ADMIN' && (
                  <div>
                    <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                      Assigned Administrator
                    </label>
                    <select
                      value={formData.admin_id}
                      onChange={(e) => handleChange('admin_id', e.target.value)}
                      className="solar-input"
                      disabled={!formData.region}
                    >
                      <option value="">Select administrator...</option>
                      {filteredAdmins.length > 0 ? (
                        filteredAdmins.map(admin => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name} ({admin.email})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No admins found in this jurisdiction</option>
                      )}
                    </select>
                    {!formData.region && (
                      <p className="text-[10px] text-solar-muted mt-2 uppercase tracking-tight italic">Select jurisdiction first to sync admins</p>
                    )}
                  </div>
                )}

                {/* Assigned Installer */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Assigned Field personnel
                  </label>
                  <select
                    value={formData.installer_id}
                    onChange={(e) => handleChange('installer_id', e.target.value)}
                    className="solar-input"
                    disabled={!formData.region}
                  >
                    <option value="">Select installer...</option>
                    {filteredInstallers.length > 0 ? (
                      filteredInstallers.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.email})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No installers found in this jurisdiction</option>
                    )}
                  </select>
                  {!formData.region && (
                    <p className="text-[10px] text-solar-muted mt-2 uppercase tracking-tight italic">Select jurisdiction first to sync personnel</p>
                  )}
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Geospatial Reference Line 1 (Street)
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                    className="solar-input"
                    placeholder="Physical deployment coordinates..."
                  />
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Geospatial Reference Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => handleChange('address_line2', e.target.value)}
                    className="solar-input"
                    placeholder="Secondary coordinates or landmark..."
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Urban Sector (City)
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="solar-input"
                    placeholder="City designation..."
                  />
                </div>

                {/* State */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Administrative State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="solar-input"
                  >
                    <option value="">Select state...</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Pincode */}
                <div>
                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-2 block">
                    Postal routing Code
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="solar-input"
                    placeholder="6-digit PIN..."
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div className="mt-8 solar-glass rounded-2xl p-4 border-solar-border/20">
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-4 block">
                  Precision Coordinate mapping
                </label>
                <div className="rounded-xl overflow-hidden border border-solar-border/30">
                  <LocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={({ latitude, longitude }) => {
                      handleChange('latitude', latitude)
                      handleChange('longitude', longitude)
                    }}
                    placeholder="Acquire location signature..."
                  />
                </div>
              </div>

              {/* Navigation Buttons for Step 3 */}
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-10 py-3 text-solar-muted font-black uppercase tracking-widest text-xs hover:text-solar-primary transition-all underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
                >
                  Return to Infrastructure
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="sun-button px-12 py-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center space-x-3">
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-solar-dark border-t-transparent rounded-full animate-spin"></div>
                        <span>Synchronizing...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Update Registry Node</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
