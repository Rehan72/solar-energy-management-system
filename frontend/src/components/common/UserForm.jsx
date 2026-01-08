import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_BASE_URL = 'http://localhost:8080'

function UserForm({ user, onClose, endpoint, currentUserRole }) {
  const [formData, setFormData] = useState({
    // Basic details
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'USER',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    
    // Solar-specific fields
    installation_status: 'NOT_INSTALLED',
    property_type: 'RESIDENTIAL',
    avg_monthly_bill: '',
    roof_area_sqft: '',
    connection_type: 'SINGLE_PHASE',
    subsidy_interest: false,
    plant_capacity_kw: '',
    installation_date: '',
    net_metering: false,
    inverter_brand: '',
    discom_name: '',
    consumer_number: '',
    device_linked: false,
    device_id: '',
    subsidy_applied: false,
    subsidy_status: '',
    scheme_name: '',
    application_id: '',
  })
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'USER',
        phone: user.phone || '',
        address_line1: user.address_line1 || '',
        address_line2: user.address_line2 || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        installation_status: user.installation_status || 'NOT_INSTALLED',
        property_type: user.property_type || 'RESIDENTIAL',
        avg_monthly_bill: user.avg_monthly_bill || '',
        roof_area_sqft: user.roof_area_sqft || '',
        connection_type: user.connection_type || 'SINGLE_PHASE',
        subsidy_interest: user.subsidy_interest || false,
        plant_capacity_kw: user.plant_capacity_kw || '',
        installation_date: user.installation_date || '',
        net_metering: user.net_metering || false,
        inverter_brand: user.inverter_brand || '',
        discom_name: user.discom_name || '',
        consumer_number: user.consumer_number || '',
        device_linked: user.device_linked || false,
        device_id: user.device_id || '',
        subsidy_applied: user.subsidy_applied || false,
        subsidy_status: user.subsidy_status || '',
        scheme_name: user.scheme_name || '',
        application_id: user.application_id || '',
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (user) {
        // Update - only send non-empty fields
        const updateData = {}
        Object.keys(formData).forEach(key => {
          if (formData[key] !== '' && formData[key] !== false) {
            updateData[key] = formData[key]
          }
        })
        await axios.put(`${API_BASE_URL}${endpoint}/${user.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create
        await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save user')
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const installationStatuses = [
    { value: 'NOT_INSTALLED', label: 'Not Installed' },
    { value: 'INSTALLATION_PLANNED', label: 'Installation Planned' },
    { value: 'INSTALLED', label: 'Installed' },
  ]

  const propertyTypes = [
    { value: 'RESIDENTIAL', label: 'Residential' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
  ]

  const connectionTypes = [
    { value: 'SINGLE_PHASE', label: 'Single Phase' },
    { value: 'THREE_PHASE', label: 'Three Phase' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive p-6 rounded-xl w-full max-w-2xl m-4">
        <h3 className="text-lg font-semibold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark mb-4">
          {user ? 'Edit User' : 'Add User'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            {!user && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required={!user}
                />
              </div>
            )}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full p-2 bg-solar-bgLight dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-md text-solar-textPrimaryLight dark:text-solar-textPrimaryDark"
              >
                {getRoleOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => handleChange('address_line1', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />
            </div>
          </div>

          {/* Solar Details */}
          <div className="border-t border-solar-border pt-4">
            <h4 className="text-md font-semibold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark mb-3">
              Solar Installation Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installation_status">Installation Status</Label>
                <select
                  id="installation_status"
                  value={formData.installation_status}
                  onChange={(e) => handleChange('installation_status', e.target.value)}
                  className="w-full p-2 bg-solar-bgLight dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-md text-solar-textPrimaryLight dark:text-solar-textPrimaryDark"
                >
                  {installationStatuses.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <select
                  id="property_type"
                  value={formData.property_type}
                  onChange={(e) => handleChange('property_type', e.target.value)}
                  className="w-full p-2 bg-solar-bgLight dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-md text-solar-textPrimaryLight dark:text-solar-textPrimaryDark"
                >
                  {propertyTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="avg_monthly_bill">Avg Monthly Bill (₹)</Label>
                <Input
                  id="avg_monthly_bill"
                  type="number"
                  value={formData.avg_monthly_bill}
                  onChange={(e) => handleChange('avg_monthly_bill', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roof_area_sqft">Roof Area (sq ft)</Label>
                <Input
                  id="roof_area_sqft"
                  type="number"
                  value={formData.roof_area_sqft}
                  onChange={(e) => handleChange('roof_area_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="connection_type">Connection Type</Label>
                <select
                  id="connection_type"
                  value={formData.connection_type}
                  onChange={(e) => handleChange('connection_type', e.target.value)}
                  className="w-full p-2 bg-solar-bgLight dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-md text-solar-textPrimaryLight dark:text-solar-textPrimaryDark"
                >
                  {connectionTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="plant_capacity_kw">Plant Capacity (kW)</Label>
                <Input
                  id="plant_capacity_kw"
                  type="number"
                  value={formData.plant_capacity_kw}
                  onChange={(e) => handleChange('plant_capacity_kw', e.target.value)}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4 mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.subsidy_interest}
                  onChange={(e) => handleChange('subsidy_interest', e.target.checked)}
                  className="w-4 h-4 text-solar-yellow border-solar-border rounded"
                />
                <span className="text-sm text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                  Subsidy Interest
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.net_metering}
                  onChange={(e) => handleChange('net_metering', e.target.checked)}
                  className="w-4 h-4 text-solar-yellow border-solar-border rounded"
                />
                <span className="text-sm text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                  Net Metering
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.device_linked}
                  onChange={(e) => handleChange('device_linked', e.target.checked)}
                  className="w-4 h-4 text-solar-yellow border-solar-border rounded"
                />
                <span className="text-sm text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                  Device Linked
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.subsidy_applied}
                  onChange={(e) => handleChange('subsidy_applied', e.target.checked)}
                  className="w-4 h-4 text-solar-yellow border-solar-border rounded"
                />
                <span className="text-sm text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">
                  Subsidy Applied
                </span>
              </label>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="inverter_brand">Inverter Brand</Label>
                <Input
                  id="inverter_brand"
                  value={formData.inverter_brand}
                  onChange={(e) => handleChange('inverter_brand', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discom_name">DISCOM Name</Label>
                <Input
                  id="discom_name"
                  value={formData.discom_name}
                  onChange={(e) => handleChange('discom_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="consumer_number">Consumer Number</Label>
                <Input
                  id="consumer_number"
                  value={formData.consumer_number}
                  onChange={(e) => handleChange('consumer_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="device_id">Device ID</Label>
                <Input
                  id="device_id"
                  value={formData.device_id}
                  onChange={(e) => handleChange('device_id', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="scheme_name">Scheme Name</Label>
                <Input
                  id="scheme_name"
                  value={formData.scheme_name}
                  onChange={(e) => handleChange('scheme_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="application_id">Application ID</Label>
                <Input
                  id="application_id"
                  value={formData.application_id}
                  onChange={(e) => handleChange('application_id', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-solar-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
