import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Globe, Users, Zap, Save, ArrowLeft } from 'lucide-react'
import { getRequest, putRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import LocationPicker from '../../components/LocationPicker'

export default function EditRegion() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    country: 'India',
    timezone: 'Asia/Kolkata',
    description: '',
    status: 'ACTIVE',
    expected_users: 0,
    expected_plants: 0,
    capacity_mw: 0
  })
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null })
  const [errors, setErrors] = useState({})

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ]

  const timezones = [
    'Asia/Kolkata',
    'Asia/Mumbai',
    'Asia/Calcutta',
    'Asia/Delhi'
  ]

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        setFetching(true)
        const response = await getRequest('/superadmin/regions')
        const regions = Array.isArray(response.data) ? response.data : []
        const region = regions.find(r => r.id === id)
        
        if (region) {
          setFormData({
            name: region.name || '',
            state: region.state || '',
            country: region.country || 'India',
            timezone: region.timezone || 'Asia/Kolkata',
            description: region.description || '',
            status: region.status || 'ACTIVE',
            expected_users: region.expected_users || 0,
            expected_plants: region.expected_plants || 0,
            capacity_mw: region.capacity_mw || 0
          })
          setCoordinates({
            latitude: region.latitude,
            longitude: region.longitude
          })
        } else {
          notify.error('Region not found')
          navigate('/regions')
        }
      } catch (err) {
        console.error(err)
        notify.error('Failed to fetch region')
        navigate('/regions')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      fetchRegion()
    }
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleLocationChange = (locationData) => {
    setCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Region name is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.timezone) newErrors.timezone = 'Timezone is required'
    if (formData.name && formData.name.length < 2) newErrors.name = 'Region name must be at least 2 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const payload = {
        name: formData.name,
        state: formData.state,
        country: formData.country,
        timezone: formData.timezone,
        description: formData.description,
        status: formData.status,
        expected_users: Number(formData.expected_users) || 0,
        expected_plants: Number(formData.expected_plants) || 0,
        capacity_mw: Number(formData.capacity_mw) || 0,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
      
      await putRequest(`/superadmin/regions/${id}`, payload)
      notify.success('Region updated successfully!')
      navigate('/regions')
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update region')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Synchronizing regional grid data..." size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading && <SunLoader message="Propagating regional updates..." />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/regions')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">
              Modify Region <span className="text-solar-orange ml-2 text-sm font-black tracking-widest">[REG-NODE-{id?.toString().slice(-4)}]</span>
            </h1>
            <p className="text-solar-muted mt-1 font-medium italic">Adjusting geographical territory parameters for the global grid.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Globe className="w-5 h-5 text-solar-yellow mr-3 group-hover:rotate-12 transition-transform" />
            Geographical Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Region Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Delhi NCR"
                className={`solar-input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="state">State/Province *</Label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`solar-input ${errors.state ? 'border-red-500' : ''}`}
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., India"
                className={`solar-input ${errors.country ? 'border-red-500' : ''}`}
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>
            <div>
              <Label htmlFor="timezone">Timezone *</Label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={`solar-input ${errors.timezone ? 'border-red-500' : ''}`}
              >
                <option value="">Select Timezone</option>
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              {errors.timezone && <p className="text-red-500 text-sm mt-1">{errors.timezone}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description about the region..."
                rows={3}
                className="solar-input min-h-[100px] resize-none py-3"
              />
            </div>
          </div>
        </div>

        {/* Region Settings */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Users className="w-5 h-5 text-solar-orange mr-3 group-hover:scale-110 transition-transform" />
            Infrastructure Targets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="expected_users">Expected Users</Label>
              <Input
                id="expected_users"
                name="expected_users"
                type="number"
                min="0"
                value={formData.expected_users || ''}
                onChange={handleChange}
                placeholder="e.g., 100"
                className="solar-input"
              />
            </div>
            <div>
              <Label htmlFor="expected_plants">Expected Plants</Label>
              <Input
                id="expected_plants"
                name="expected_plants"
                type="number"
                min="0"
                value={formData.expected_plants || ''}
                onChange={handleChange}
                placeholder="e.g., 10"
                className="solar-input"
              />
            </div>
            <div>
              <Label htmlFor="capacity_mw">Total Capacity (MW)</Label>
              <Input
                id="capacity_mw"
                name="capacity_mw"
                type="number"
                min="0"
                step="0.1"
                value={formData.capacity_mw || ''}
                onChange={handleChange}
                placeholder="e.g., 500"
                className="solar-input"
              />
            </div>
          </div>
        </div>

        {/* Location Picker */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <MapPin className="w-5 h-5 text-solar-orange mr-3 group-hover:scale-110 transition-transform" />
            Geospatial Jurisdiction
          </h2>
          <p className="text-xs font-bold text-solar-muted uppercase mb-4 tracking-widest">Calibrate regional GPS telemetry</p>
          <div className="rounded-xl overflow-hidden border border-solar-border/30">
            <LocationPicker
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>

        {/* Status */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Zap className="w-5 h-5 text-solar-success mr-3 group-hover:scale-110 transition-transform" />
            Regional Operational State
          </h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={formData.status === 'ACTIVE'}
                  onChange={handleChange}
                  className="w-5 h-5 accent-solar-success appearance-none border-2 border-solar-border rounded-full checked:bg-solar-success checked:border-solar-success transition-all"
                />
                <div className={`absolute w-2 h-2 bg-white rounded-full scale-0 transition-transform ${formData.status === 'ACTIVE' ? 'scale-100' : ''}`}></div>
              </div>
              <span className={`text-sm font-black uppercase tracking-widest ${formData.status === 'ACTIVE' ? 'text-solar-success' : 'text-solar-muted'}`}>Grid Online</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="status"
                  value="MAINTENANCE"
                  checked={formData.status === 'MAINTENANCE'}
                  onChange={handleChange}
                  className="w-5 h-5 accent-solar-warning appearance-none border-2 border-solar-border rounded-full checked:bg-solar-warning checked:border-solar-warning transition-all"
                />
                <div className={`absolute w-2 h-2 bg-white rounded-full scale-0 transition-transform ${formData.status === 'MAINTENANCE' ? 'scale-100' : ''}`}></div>
              </div>
              <span className={`text-sm font-black uppercase tracking-widest ${formData.status === 'MAINTENANCE' ? 'text-solar-warning' : 'text-solar-muted'}`}>Sector Maintenance</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="status"
                  value="INACTIVE"
                  checked={formData.status === 'INACTIVE'}
                  onChange={handleChange}
                  className="w-5 h-5 accent-solar-danger appearance-none border-2 border-solar-border rounded-full checked:bg-solar-danger checked:border-solar-danger transition-all"
                />
                <div className={`absolute w-2 h-2 bg-white rounded-full scale-0 transition-transform ${formData.status === 'INACTIVE' ? 'scale-100' : ''}`}></div>
              </div>
              <span className={`text-sm font-black uppercase tracking-widest ${formData.status === 'INACTIVE' ? 'text-solar-danger' : 'text-solar-muted'}`}>Grid Offline</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-6 pt-4">
          <button
            type="button"
            onClick={() => navigate('/regions')}
            className="px-8 py-3 text-solar-muted font-black uppercase tracking-widest text-xs hover:text-solar-primary transition-all underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
          >
            Abort Synchronization
          </button>
          <button
            type="submit"
            disabled={loading}
            className="sun-button px-10 py-3"
          >
            <div className="flex items-center space-x-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Regional Node</span>
                </>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}
