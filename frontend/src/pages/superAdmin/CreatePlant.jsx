import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, MapPin, Battery, TrendingUp, Save, ArrowLeft } from 'lucide-react'
import { postRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import LocationPicker from '../../components/LocationPicker'

export default function CreatePlant() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    region: '',
    capacity_kw: '',
    current_output_kw: '',
    efficiency: '',
    status: 'ACTIVE',
    description: ''
  })
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null })
  const [errors, setErrors] = useState({})

  const regions = ['Delhi', 'Mumbai', 'Patna', 'Ahmedabad', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
    if (!formData.region) newErrors.region = 'Region is required'
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
        ...formData,
        capacity_kw: parseFloat(formData.capacity_kw),
        current_output_kw: formData.current_output_kw ? parseFloat(formData.current_output_kw) : 0,
        efficiency: formData.efficiency ? parseFloat(formData.efficiency) : 85,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
      
      await postRequest('/superadmin/plants', payload)
      notify.success('Plant created successfully!')
      navigate('/plants')
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to create plant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/plants')}
          className="p-2 rounded-lg hover:bg-solar-panel/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-solar-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Create New Plant</h1>
          <p className="text-solar-muted mt-1">Add a new solar power plant to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Zap className="w-5 h-5 text-solar-yellow mr-2" />
            Basic Information
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
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="region">Region *</Label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={`w-full h-10 bg-solar-night/50 text-solar-primary border rounded-lg px-3 focus:outline-none focus:border-solar-yellow ${errors.region ? 'border-red-500' : 'border-solar-border'}`}
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location Address *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Sector 15, Rohini, Delhi - 110085"
                className={errors.location ? 'border-red-500' : ''}
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
                className="w-full bg-solar-night/50 text-solar-primary border border-solar-border rounded-lg px-3 py-2 focus:outline-none focus:border-solar-yellow resize-none"
              />
            </div>
          </div>
        </div>

        {/* Capacity & Performance */}
        <div className="bg-solar-card rounded-xl p-6 ">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Battery className="w-5 h-5 text-solar-success mr-2" />
            Capacity & Performance
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
                className={errors.capacity_kw ? 'border-red-500' : ''}
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
                className={errors.efficiency ? 'border-red-500' : ''}
              />
              {errors.efficiency && <p className="text-red-500 text-sm mt-1">{errors.efficiency}</p>}
            </div>
          </div>
        </div>

        {/* Location Picker */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-solar-orange mr-2" />
            Plant Location
          </h2>
          <p className="text-sm text-solar-muted mb-4">Search for a location or use the map to pin the exact plant position</p>
          <LocationPicker
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Status */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-solar-primary mr-2" />
            Plant Status
          </h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={formData.status === 'ACTIVE'}
                onChange={handleChange}
                className="accent-solar-success"
              />
              <span className="text-solar-primary">Active</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="MAINTENANCE"
                checked={formData.status === 'MAINTENANCE'}
                onChange={handleChange}
                className="accent-solar-warning"
              />
              <span className="text-solar-primary">Under Maintenance</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="INACTIVE"
                checked={formData.status === 'INACTIVE'}
                onChange={handleChange}
                className="accent-solar-danger"
              />
              <span className="text-solar-primary">Inactive</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => navigate('/plants')}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-solar-yellow text-solar-dark hover:bg-solar-orange flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-solar-dark border-t-transparent" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create Plant</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
