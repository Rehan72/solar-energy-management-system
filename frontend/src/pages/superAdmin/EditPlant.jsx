import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Zap, MapPin, Battery, TrendingUp, Save, ArrowLeft } from 'lucide-react'
import { putRequest, getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import LocationPicker from '../../components/LocationPicker'
import SunLoader from '../../components/SunLoader'

export default function EditPlant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchingPlant, setFetchingPlant] = useState(true)
  const [regions, setRegions] = useState([])
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    region_id: '',
    region: '',
    capacity_kw: '',
    current_output_kw: '',
    efficiency: '',
    status: 'ACTIVE',
    description: ''
  })
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null })
  const [errors, setErrors] = useState({})

  // Fetch plant data and regions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingPlant(true)
        
        // Fetch regions
        setLoadingRegions(true)
        try {
          const regionsResponse = await getRequest('/superadmin/regions')
          const regionsData = regionsResponse.data || regionsResponse || []
          setRegions(regionsData)
        } catch (error) {
          console.error('Failed to fetch regions:', error)
          setRegions([])
        } finally {
          setLoadingRegions(false)
        }

        // Fetch plant data
        const plantResponse = await getRequest(`/superadmin/plants/${id}`)
        const plant = plantResponse.data?.plant || plantResponse.data || plantResponse
        
        if (plant) {
          setFormData({
            name: plant.name || '',
            location: plant.location || '',
            region_id: plant.region_id || '',
            region: plant.region || '',
            capacity_kw: plant.capacity_kw || '',
            current_output_kw: plant.current_output_kw || '',
            efficiency: plant.efficiency || '',
            status: plant.status || 'ACTIVE',
            description: plant.description || ''
          })
          setCoordinates({
            latitude: plant.latitude || null,
            longitude: plant.longitude || null
          })
        }
      } catch (error) {
        console.error('Failed to fetch plant:', error)
        notify.error('Failed to load plant data')
      } finally {
        setFetchingPlant(false)
      }
    }
    
    fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // When region_id changes, also update region name for display
    if (name === 'region_id') {
      const selectedRegion = regions.find(r => r.id === value)
      if (selectedRegion) {
        setFormData(prev => ({ ...prev, [name]: value, region: selectedRegion.name }))
      }
    }
    
    // Clear error when field is modified
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
    if (!formData.name.trim()) newErrors.name = 'Plant name is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    // Only require region_id if it was originally set and user is changing it
    // If region_id was null but region name exists, allow the update
    if (!formData.region_id && !formData.region) newErrors.region_id = 'Region is required'
    if (!formData.capacity_kw) newErrors.capacity_kw = 'Capacity is required'
    if (formData.capacity_kw && parseFloat(formData.capacity_kw) <= 0) newErrors.capacity_kw = 'Capacity must be greater than 0'
    if (formData.efficiency && (parseFloat(formData.efficiency) < 0 || parseFloat(formData.efficiency) > 100)) {
      newErrors.efficiency = 'Efficiency must be between 0 and 100'
    }
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
        location: formData.location,
        region_id: formData.region_id,
        region: formData.region,
        capacity_kw: parseFloat(formData.capacity_kw),
        current_output_kw: formData.current_output_kw ? parseFloat(formData.current_output_kw) : 0,
        efficiency: formData.efficiency ? parseFloat(formData.efficiency) : 85,
        status: formData.status,
        description: formData.description,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
      
      await putRequest(`/superadmin/plants/${id}`, payload)
      notify.success('Plant updated successfully!')
      navigate('/plants')
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update plant')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingPlant) {
    return (
      <div className="space-y-6 relative min-h-[400px]">
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Acquiring asset telemetry..." size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading && <SunLoader message="Propagating asset updates..." />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/plants')}
            className="p-2 solar-glass rounded-lg hover:bg-solar-panel/20 transition-all border border-solar-border/30"
          >
            <ArrowLeft className="w-5 h-5 text-solar-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">
              Modify Asset <span className="text-solar-yellow ml-2 text-sm font-black tracking-widest">[NODE-{id?.toString().padStart(4, '0')}]</span>
            </h1>
            <p className="text-solar-muted mt-1 font-medium italic">Standardizing infrastructure parameters for the regional grid.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Zap className="w-5 h-5 text-solar-yellow mr-3 group-hover:scale-110 transition-transform" />
            Core Deployment Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Plant Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Delhi Solar Farm Phase 1"
                className={`solar-input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="region_id">Region *</Label>
              {loadingRegions ? (
                <div className="w-full h-10 bg-solar-night/50 border border-solar-border rounded-lg px-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-solar-yellow border-t-transparent mr-2"></div>
                  <span className="text-solar-muted">Loading regions...</span>
                </div>
              ) : formData.region_id ? (
                <select
                  id="region_id"
                  name="region_id"
                  value={formData.region_id}
                  onChange={handleChange}
                  className={`solar-input ${errors.region_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name} - {region.state}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full h-10 bg-solar-night/50 border border-solar-border rounded-lg px-3 flex items-center text-solar-primary">
                  {formData.region || 'Region not assigned'}
                </div>
              )}
              {errors.region_id && <p className="text-red-500 text-sm mt-1">{errors.region_id}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location Address *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Sector 15, Rohini, Delhi - 110085"
                className={`solar-input ${errors.location ? 'border-red-500' : ''}`}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description about the solar plant..."
                rows={3}
                className="solar-input min-h-[100px] resize-none py-3"
              />
            </div>
          </div>
        </div>

        {/* Capacity & Performance */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <Battery className="w-5 h-5 text-solar-success mr-3 group-hover:scale-110 transition-transform" />
            Energy Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="capacity_kw">Capacity (kW) *</Label>
              <Input
                id="capacity_kw"
                name="capacity_kw"
                type="number"
                min="0"
                step="0.1"
                value={formData.capacity_kw}
                onChange={handleChange}
                placeholder="e.g., 1000"
                className={`solar-input ${errors.capacity_kw ? 'border-red-500' : ''}`}
              />
              {errors.capacity_kw && <p className="text-red-500 text-sm mt-1">{errors.capacity_kw}</p>}
            </div>
            <div>
              <Label htmlFor="current_output_kw">Current Output (kW)</Label>
              <Input
                id="current_output_kw"
                name="current_output_kw"
                type="number"
                min="0"
                step="0.1"
                value={formData.current_output_kw}
                onChange={handleChange}
                placeholder="e.g., 0"
                className="solar-input"
              />
            </div>
            <div>
              <Label htmlFor="efficiency">Efficiency (%)</Label>
              <Input
                id="efficiency"
                name="efficiency"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.efficiency}
                onChange={handleChange}
                placeholder="e.g., 85"
                className={`solar-input ${errors.efficiency ? 'border-red-500' : ''}`}
              />
              {errors.efficiency && <p className="text-red-500 text-sm mt-1">{errors.efficiency}</p>}
            </div>
          </div>
        </div>

        {/* Location Picker */}
        <div className="solar-glass rounded-2xl p-6 group">
          <h2 className="text-lg font-black text-solar-primary mb-6 flex items-center uppercase tracking-tight">
            <MapPin className="w-5 h-5 text-solar-orange mr-3 group-hover:scale-110 transition-transform" />
            Geospatial Positioning
          </h2>
          <p className="text-xs font-bold text-solar-muted uppercase mb-4 tracking-widest">Update GPS telemetry coordinates</p>
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
            <TrendingUp className="w-5 h-5 text-solar-panel mr-3 group-hover:scale-110 transition-transform" />
            Operational State
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
              <span className={`text-sm font-black uppercase tracking-widest ${formData.status === 'ACTIVE' ? 'text-solar-success' : 'text-solar-muted'}`}>System Active</span>
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
              <span className={`text-sm font-black uppercase tracking-widest ${formData.status === 'MAINTENANCE' ? 'text-solar-warning' : 'text-solar-muted'}`}>Under Maintenance</span>
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
              <span className={`text-sm font-black uppercase tracking-widest ${formData.status === 'INACTIVE' ? 'text-solar-danger' : 'text-solar-muted'}`}>Node Inactive</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-6 pt-4">
          <button
            type="button"
            onClick={() => navigate('/plants')}
            className="px-8 py-3 text-solar-muted font-black uppercase tracking-widest text-xs hover:text-solar-primary transition-all underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
          >
            Abort Protocol
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
                  <span>Propagating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Asset Node</span>
                </>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}
