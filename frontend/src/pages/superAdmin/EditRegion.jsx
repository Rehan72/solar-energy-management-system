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
      } catch (error) {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-solar-yellow border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/regions')}
          className="p-2 rounded-lg hover:bg-solar-panel/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-solar-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Edit Region</h1>
          <p className="text-solar-muted mt-1">Update region information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Globe className="w-5 h-5 text-solar-yellow mr-2" />
            Basic Information
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
                className={errors.name ? 'border-red-500' : ''}
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
                className={`w-full h-10 bg-solar-night/50 text-solar-primary border rounded-lg px-3 focus:outline-none focus:border-solar-yellow ${errors.state ? 'border-red-500' : 'border-solar-border'}`}
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
                className={errors.country ? 'border-red-500' : ''}
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
                className={`w-full h-10 bg-solar-night/50 text-solar-primary border rounded-lg px-3 focus:outline-none focus:border-solar-yellow ${errors.timezone ? 'border-red-500' : 'border-solar-border'}`}
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
                className="w-full bg-solar-night/50 text-solar-primary border border-solar-border rounded-lg px-3 py-2 focus:outline-none focus:border-solar-yellow resize-none"
              />
            </div>
          </div>
        </div>

        {/* Region Settings */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-solar-orange mr-2" />
            Region Settings
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
              />
            </div>
          </div>
        </div>

        {/* Location Picker */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-solar-orange mr-2" />
            Region Location
          </h2>
          <p className="text-sm text-solar-muted mb-4">Search for a location or use the map to pin the exact region position</p>
          <LocationPicker
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Status */}
        <div className="bg-solar-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Zap className="w-5 h-5 text-solar-success mr-2" />
            Region Status
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
            onClick={() => navigate('/regions')}
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
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Region</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
