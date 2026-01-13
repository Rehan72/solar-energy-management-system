import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, User, Mail, Lock, CheckCircle, Phone, MapPin, Eye, EyeOff, Shield, Zap } from 'lucide-react'
import LocationPicker from '../../components/LocationPicker'
import ProfileImageUpload from '../../components/ProfileImageUpload'
import { postRequest, getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import SunLoader from '../../components/SunLoader'

export default function CreateUser() {
  const navigate = useNavigate()
  const currentUserRole = localStorage.getItem('role')
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
    profile_image: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    region: '',
    latitude: null,
    longitude: null,
    admin_id: '',
    installer_id: '',
    plant_id: '',

    // Solar-specific
    installation_status: 'NOT_INSTALLED',
    property_type: 'RESIDENTIAL',
    avg_monthly_bill: '',
    roof_area_sqft: '',
    connection_type: 'SINGLE_PHASE',
    subsidy_interest: false,

    // Installed user fields
    plant_capacity_kw: '',
    installation_date: '',
    project_cost: '',
    net_metering: false,
    inverter_brand: '',
    discom_name: '',
    consumer_number: '',
    subsidy_applied: false,
    subsidy_status: '',
    scheme_name: '',
    application_id: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [admins, setAdmins] = useState([])
  const [installers, setInstallers] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [filteredInstallers, setFilteredInstallers] = useState([])
  const [plants, setPlants] = useState([])
  const [filteredPlants, setFilteredPlants] = useState([])
  const dataLoadedRef = useRef(false)

  const [regions, setRegions] = useState([])
  
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
  ]
  
  // Fetch admins, installers, regions and plants on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          getRequest('/superadmin/regions'),
           getRequest('/superadmin/plants'),
          getRequest('/admin/installers'),
         
          
        ]
        if (currentUserRole === 'SUPER_ADMIN') {
          promises.push(getRequest('/superadmin/admins'))
        }

        const results = await Promise.all(promises)
        const regionsRes = results[0]
        const plantsRes = results[1]
        const installersRes = results[2]
        const adminsRes = currentUserRole === 'SUPER_ADMIN' ? results[3] : { data: { admins: [] } }

        const adminsData = (adminsRes.data.admins || []).map(admin => ({
          ...admin,
          name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
        }))
        const installersData = (installersRes.data.installers || []).map(inst => ({
          ...inst,
          name: `${inst.first_name || ''} ${inst.last_name || ''}`.trim()
        }))
        const plantsData = plantsRes.data.plants || []
        const regionsData = regionsRes.data || []

        setAdmins(adminsData)
        setInstallers(installersData)
        setPlants(plantsData)
        setRegions(regionsData)
        setFilteredAdmins(adminsData)
        setFilteredInstallers(installersData)
        setFilteredPlants(plantsData)
        dataLoadedRef.current = true
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  // Filter admins, installers and plants when region or admin changes
  useEffect(() => {
    let currentFilteredAdmins = admins
    let currentFilteredInstallers = installers
    let currentFilteredPlants = plants

    if (formData.region) {
      const selectedRegionObj = regions.find(r => r.name === formData.region)
      currentFilteredAdmins = admins.filter(a => 
        a.region === formData.region || 
        (selectedRegionObj && a.region === selectedRegionObj.state)
      )
      currentFilteredInstallers = installers.filter(i => 
        i.region === formData.region || 
        (selectedRegionObj && i.region === selectedRegionObj.state)
      )
      currentFilteredPlants = plants.filter(p => p.region === formData.region)
    }

    if (formData.plant_id) {
      currentFilteredAdmins = currentFilteredAdmins.filter(a => a.plant_id === formData.plant_id || !a.plant_id)
      currentFilteredInstallers = currentFilteredInstallers.filter(i => i.plant_id === formData.plant_id || !i.plant_id)
    }

    if (formData.admin_id) {
      currentFilteredInstallers = currentFilteredInstallers.filter(i => i.admin_id === formData.admin_id)
    }

    setFilteredAdmins(currentFilteredAdmins)
    setFilteredInstallers(currentFilteredInstallers)
    setFilteredPlants(currentFilteredPlants)
  }, [formData.region, formData.plant_id, formData.admin_id, admins, installers, plants])

  // Reset selections when region or admin changes
  const prevRegion = useRef(formData.region)
  const prevAdmin = useRef(formData.admin_id)
  const prevPlant = useRef(formData.plant_id)

  useEffect(() => {
    if (dataLoadedRef.current) {
      if (prevRegion.current !== formData.region) {
        setFormData(prev => ({ ...prev, plant_id: '', admin_id: '', installer_id: '' }))
      } else if (prevPlant.current !== formData.plant_id) {
        setFormData(prev => ({ ...prev, admin_id: '', installer_id: '' }))
      } else if (prevAdmin.current !== formData.admin_id) {
        setFormData(prev => ({ ...prev, installer_id: '' }))
      }
    }
    prevRegion.current = formData.region
    prevPlant.current = formData.plant_id
    prevAdmin.current = formData.admin_id
  }, [formData.region, formData.plant_id, formData.admin_id])

  const handleChange = (field, value) => {
    let updates = { [field]: value }

    // Auto-fill location if plant is selected
    if (field === 'plant_id' && value) {
      const selectedPlant = plants.find(p => p.id === value)
      if (selectedPlant && selectedPlant.latitude !== null && selectedPlant.longitude !== null) {
        updates.latitude = selectedPlant.latitude
        updates.longitude = selectedPlant.longitude
        notify.info(`Location updated based on ${selectedPlant.name} plant`)
      }
    }

    setFormData(prev => ({ ...prev, ...updates }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = (e) => {
    e.preventDefault()
    setStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setErrors({})

    // Validation for Admin creation
    if (formData.role === 'ADMIN') {
        if (!formData.region) {
            setErrors({ submit: "Region is required for Admins" });
            notify.error("Region is required for Admins");
            setLoading(false);
            return;
        }
        if (!formData.plant_id) {
            setErrors({ submit: "Plant is required for Admins" });
             notify.error("Plant is required for Admins");
            setLoading(false);
            return;
        }
    }

    try {
      const payload = {
        ...formData,
        avg_monthly_bill: parseFloat(formData.avg_monthly_bill) || 0,
        roof_area_sqft: parseFloat(formData.roof_area_sqft) || 0,
        plant_capacity_kw: parseFloat(formData.plant_capacity_kw) || 0,
        project_cost: parseFloat(formData.project_cost) || 0,
      }

      await postRequest('/admin/users', payload)

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
          <p className="text-solar-muted">Redirecting to users list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading && <SunLoader message="Creating user..." />}

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
          <h1 className="text-2xl font-bold sun-glow-text">Create User</h1>
          <p className="text-solar-muted mt-1">Add a new user step by step</p>
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

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
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
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2 cursor-pointer">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className={`w-full px-4 py-3 bg-solar-night/80 border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 ${errors.first_name ? 'border-solar-danger' : 'border-solar-yellow'}`}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <p className="text-sm text-red-800 mt-1">{errors.first_name}</p>}
                </div>

                {currentUserRole === 'SUPER_ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-solar-primary mb-2">
                       <Shield className="w-4 h-4 inline mr-2" />
                       User Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="INSTALLER">Installer</option>
                      <option value="GOVT">Govt Official</option>
                    </select>
                  </div>
                )}

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
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <p className="text-sm text-red-800 mt-1">{errors.last_name}</p>}
                </div>

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
                    placeholder="user@example.com"
                  />
                  {errors.email && <p className="text-sm text-red-800 mt-1">{errors.email}</p>}
                </div>

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
                    placeholder="+91 9876543210"
                  />
                </div>

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

              <div className="flex justify-end pt-4">
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
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-solar-primary">Installation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Installation Status
                  </label>
                  <select
                    value={formData.installation_status}
                    onChange={(e) => handleChange('installation_status', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                  >
                    <option value="NOT_INSTALLED">Not Installed</option>
                    <option value="INSTALLATION_PLANNED">Installation Planned</option>
                    <option value="INSTALLED">Installed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Property Type
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleChange('property_type', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Average Monthly Bill (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.avg_monthly_bill}
                    onChange={(e) => handleChange('avg_monthly_bill', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                    placeholder="Enter average bill"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Roof Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={formData.roof_area_sqft}
                    onChange={(e) => handleChange('roof_area_sqft', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                    placeholder="Enter roof area"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Project Cost / Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.project_cost}
                    onChange={(e) => handleChange('project_cost', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                    placeholder="Enter total amount"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Connection Type
                  </label>
                  <select
                    value={formData.connection_type}
                    onChange={(e) => handleChange('connection_type', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                  >
                    <option value="SINGLE_PHASE">Single Phase</option>
                    <option value="THREE_PHASE">Three Phase</option>
                  </select>
                </div>

                <div className="flex items-center pt-8">
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

              {formData.installation_status === 'INSTALLED' && (
                <div className="mt-6 p-4 bg-solar-panel/20 rounded-lg border border-solar-border">
                  <h4 className="text-md font-semibold text-solar-primary mb-4">Installed Plant Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Plant Capacity (kW)
                      </label>
                      <input
                        type="number"
                        value={formData.plant_capacity_kw}
                        onChange={(e) => handleChange('plant_capacity_kw', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                        placeholder="e.g., 5.0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Installation Date
                      </label>
                      <input
                        type="date"
                        value={formData.installation_date}
                        onChange={(e) => handleChange('installation_date', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Inverter Brand
                      </label>
                      <input
                        type="text"
                        value={formData.inverter_brand}
                        onChange={(e) => handleChange('inverter_brand', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                        placeholder="e.g., Luminous, Microtek"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        DISCOM Name
                      </label>
                      <input
                        type="text"
                        value={formData.discom_name}
                        onChange={(e) => handleChange('discom_name', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                        placeholder="Enter DISCOM name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-solar-primary mb-2">
                        Consumer Number
                      </label>
                      <input
                        type="text"
                        value={formData.consumer_number}
                        onChange={(e) => handleChange('consumer_number', e.target.value)}
                        className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                        placeholder="Enter consumer ID"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
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
                  Next: Location & Assignment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location & Assignment */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-solar-primary">Location & Assignment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                  >
                    <option value="">Select a region</option>
                    {regions?.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Solar Plant
                  </label>
                  <select
                    value={formData.plant_id}
                    onChange={(e) => handleChange('plant_id', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                    disabled={!formData.region}
                  >
                    <option value="">Select a plant</option>
                    {filteredPlants?.map(plant => (
                      <option key={plant.id} value={plant.id}>{plant.name}</option>
                    ))}
                  </select>
                </div>

                {/* Hide Admin selection if creating an Admin or Super Admin, or if role is INSTALLER (might need admin logic) */}
                {currentUserRole === 'SUPER_ADMIN' && formData.role !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-solar-primary mb-2">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Assigned Admin (Optional)
                    </label>
                    <select
                      value={formData.admin_id}
                      onChange={(e) => handleChange('admin_id', e.target.value)}
                      className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                      disabled={!formData.region}
                    >
                      <option value="">Select an admin</option>
                      {filteredAdmins?.map(admin => (
                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Assigned Installer
                  </label>
                  <select
                    value={formData.installer_id}
                    onChange={(e) => handleChange('installer_id', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                    disabled={!formData.region}
                  >
                    <option value="">Select an installer</option>
                    {filteredInstallers?.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary focus:outline-none focus:ring-2"
                  >
                    <option value="">Select state</option>
                    {indianStates?.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-solar-primary mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                    className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
                    placeholder="Street, House No."
                  />
                </div>
              </div>

              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={({ latitude, longitude }) => {
                  setFormData(prev => ({ ...prev, latitude, longitude }))
                }}
              />

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 bg-solar-card hover:bg-solar-panel/20 text-solar-primary font-semibold rounded-lg transition sun-button"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
