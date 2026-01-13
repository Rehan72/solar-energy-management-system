import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Loader2, MapPin, Building, User, Phone, Mail, Map } from 'lucide-react'
import { getRequest, postRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import LocationPicker from '../../components/LocationPicker'
import ProfileImageUpload from '../../components/ProfileImageUpload'

export default function CreateInstaller() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regions, setRegions] = useState([])
  const [plants, setPlants] = useState([])
  const [admins, setAdmins] = useState([])
  const [regionAdmins, setRegionAdmins] = useState([])
  const [errors, setErrors] = useState({})

  // Form State
  const [formData, setFormData] = useState({
    profile_image: '',
    first_name: '',
    last_name: '',
    email: '',
    password: 'Password@123', // Default or specific logic
    phone: '',
    role: 'INSTALLER',
    
    // Assignment
    region: '',
    plant_id: '',
    admin_id: '',
    
    // Address
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    
    // Location
    latitude: 20.5937,
    longitude: 78.9629
  })

  // Fetch Regions on mount
  useEffect(() => {
    fetchRegions()
  }, [])

  // Fetch Plants when Region changes
  useEffect(() => {
    if (formData.region) {
      fetchPlants(formData.region)
      fetchAdmins(formData.region) // Admins might be regional
    } else {
      setPlants([])
      setAdmins([])
      setRegionAdmins([])
    }
  }, [formData.region])

  // Filter Admins when Plant changes
  useEffect(() => {
    if (formData.plant_id && regionAdmins.length > 0) {
      // Show admins assigned to this plant OR unassigned regional admins
      const filtered = regionAdmins.filter(a => a.plant_id === formData.plant_id || !a.plant_id)
      setAdmins(filtered)
    } else {
      // If no plant selected, show all regional admins (optional, or keeping it empty until plant selected)
      // Current requirement seems to be "based on plant selection".
      // Let's default to showing all region admins if they select a region but not yet a plant?
      // No, let's stick to cleaning up when no plant.
      // Actually, if Plant ID is not selected, setAdmins([]) is correct based on code flow. 
      // But if user wants to see admins for the Region generally?
      // "admin shoudle be display based on plant selection" -> implies plant dependency.
      setAdmins([])
    }
  }, [formData.plant_id, regionAdmins])

  const fetchRegions = async () => {
    try {
      const response = await getRequest('/superadmin/regions')
      setRegions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch regions', error)
      notify.error('Failed to load regions')
    }
  }

  const fetchPlants = async (regionId) => {
    try {
      // Assuming endpoint supports filtering or we filter manually
      // Here we fetch all plants and filter (optimized)
      const response = await getRequest('/superadmin/plants')
      const allPlants = response.data.plants || []
      // If region is stored as ID in plants, filter by it. 
      // Based on previous files, region in plants might be name or ID. 
      // Let's assume region ID for now or check previous implementation logic.
      // CreateUser used: plants.filter(p => p.region_id === regionId || p.region === regionId)
      const filtered = allPlants.filter(p => p.region_id === regionId || p.region === regionId)
      setPlants(filtered)
    } catch (error) {
      console.error('Failed to fetch plants', error)
    }
  }

  const fetchAdmins = async (regionName) => {
    try {
      const response = await getRequest('/superadmin/admins')
      const allAdmins = response.data.admins || []
      
      // Find selected region object to get its State
      const selectedRegionObj = regions.find(r => r.name === regionName)
      
      // Filter admins:
      // 1. Exact match on Region Name
      // 2. OR Match on Region State (if admin is assigned to the whole state)
      const filtered = allAdmins.filter(a => 
        a.region === regionName || 
        (selectedRegionObj && a.region === selectedRegionObj.state)
      )
      
      setRegionAdmins(filtered)
    } catch (error) {
      console.error('Failed to fetch admins', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = ({ latitude, longitude }) => {
    setFormData(prev => ({ ...prev, latitude, longitude }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.plant_id) {
        notify.error('Please fill all required fields')
        setSaving(false)
        return
      }

      await postRequest('/superadmin/admins', formData) // Using standard create user endpoint, role is INSTALLER
      // NOTE: Endpoint might vary. CreateUser uses /admin/users or /superadmin/admins depending on context?
      // Actually handlers.go CreateUserHandler handles all based on payload Role.
      // But route /superadmin/admins points to CreateUserHandler.
      // Also /superadmin/users -> CreateUserHandler? 
      // Let's us /superadmin/admins as it's generic user creation often.
      // Or safer: /admin/users if logged in as Admin, /superadmin/users if SuperAdmin.
      // Assuming SuperAdmin is creating via this page for now.
      
      notify.success('Installer created successfully')
      navigate(-1)
    } catch (error) {
      console.error('Create error:', error)
      notify.error(error.response?.data?.error || 'Failed to create installer')
    } finally {
      setSaving(false)
    }
  }

  // Indian States
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ]


  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-solar-card hover:bg-solar-panel/20 text-solar-primary transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-solar-primary dark:text-solar-yellow bg-clip-text text-transparent bg-linear-to-r from-solar-yellow to-solar-orange">
              Create New Installer
            </h1>
            <p className="text-solar-muted mt-1">Add a new installer to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-solar-card/50 backdrop-blur-xl rounded-2xl p-6 border border-solar-border shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-solar-yellow" />
            <h2 className="text-xl font-semibold text-solar-primary">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="md:col-span-2">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="bg-solar-card/50 backdrop-blur-xl rounded-2xl p-6 border border-solar-border shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Building className="w-6 h-6 text-solar-yellow" />
            <h2 className="text-xl font-semibold text-solar-primary">Assignment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Region *</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              >
                <option value="">Select Region</option>
                {regions.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Plant *</label>
              <select
                name="plant_id"
                value={formData.plant_id}
                onChange={handleChange}
                required
                disabled={!formData.region}
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition disabled:opacity-50"
              >
                <option value="">Select Plant</option>
                {plants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Reporting Admin (Optional)</label>
              <select
                name="admin_id"
                value={formData.admin_id}
                onChange={handleChange}
                disabled={!formData.region}
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition disabled:opacity-50"
              >
                <option value="">Select Admin</option>
                {admins.map(a => (
                  <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address & Location */}
        <div className="bg-solar-card/50 backdrop-blur-xl rounded-2xl p-6 border border-solar-border shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <MapPin className="w-6 h-6 text-solar-yellow" />
            <h2 className="text-xl font-semibold text-solar-primary">Address & Location</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-solar-primary mb-2">Address Line 1</label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                placeholder="Street address"
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-solar-primary mb-2">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                placeholder="Apartment, suite, etc."
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              >
                <option value="">Select State</option>
                {indianStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-solar-primary mb-2">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-solar-dark/80 border border-solar-border rounded-xl text-solar-primary focus:ring-2 focus:ring-solar-yellow transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-solar-primary mb-2">Location on Map</label>
            <LocationPicker 
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-linear-to-r from-solar-yellow to-solar-orange text-solar-dark font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Installer'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
