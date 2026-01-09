import { useState, useEffect } from 'react'
import { Cpu, RefreshCw, Trash2, Edit, Wifi, WifiOff, Power, PowerOff, Search, Filter, User, Zap, Sun, Battery, Activity } from 'lucide-react'
import { getRequest, putRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import StatCard from '../../components/ui/stat-card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function AdminDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPowerModal, setShowPowerModal] = useState(false)
  const [powerDetails, setPowerDetails] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', location: '', is_active: true, assigned_to: null })

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/admin/devices')
      setDevices(response.data.devices || [])
    } catch {
      notify.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDevices() }, [])

  const handleToggleActive = async (device) => {
    try {
      await putRequest(`/admin/devices/${device.id}`, { is_active: !device.is_active })
      notify.success(`Device ${device.is_active ? 'deactivated' : 'activated'}`)
      fetchDevices()
    } catch { notify.error('Failed to update device status') }
  }

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) return
    try {
      await deleteRequest(`/admin/devices/${deviceId}`)
      notify.success('Device deleted successfully')
      fetchDevices()
    } catch { notify.error('Failed to delete device') }
  }

  const handleEditDevice = (device) => {
    setSelectedDevice(device)
    setEditForm({
      name: device.name,
      location: device.location,
      is_active: device.is_active,
      assigned_to: device.assigned_to
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      await putRequest(`/admin/devices/${selectedDevice.id}`, editForm)
      notify.success('Device updated successfully')
      setShowEditModal(false)
      fetchDevices()
    } catch { notify.error('Failed to update device') }
  }

  const fetchDevicePower = async (device) => {
    try {
      const response = await getRequest(`/admin/devices/${device.id}/power`)
      setPowerDetails(response.data)
      setSelectedDevice(device)
      setShowPowerModal(true)
    } catch {
      notify.error('Failed to fetch power details')
    }
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.device_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && device.is_active) ||
                         (filterStatus === 'INACTIVE' && !device.is_active)
    return matchesSearch && matchesStatus
  })

  const activeDevices = devices.filter(d => d.is_active).length
  const inactiveDevices = devices.filter(d => !d.is_active).length
  const totalUsers = new Set(devices.map(d => d.assigned_to).filter(Boolean)).size

  // Calculate total power stats
  const totalCurrentPower = devices.reduce((sum, d) => sum + (d.current_power || 0), 0)
  const totalTodayEnergy = devices.reduce((sum, d) => sum + (d.today_energy || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Device Management</h1>
          <p className="text-solar-muted mt-1">Manage all devices across the platform</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchDevices} 
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" /><span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatCard 
          title="Total Devices" 
          value={devices.length} 
          icon={Cpu} 
          color="text-solar-yellow" 
          gradient="from-solar-yellow/20 to-solar-orange/10" 
        />
        <StatCard 
          title="Active" 
          value={activeDevices} 
          icon={Wifi} 
          color="text-solar-success" 
          gradient="from-solar-success/20 to-solar-success/5" 
        />
        <StatCard 
          title="Inactive" 
          value={inactiveDevices} 
          icon={WifiOff} 
          color="text-solar-warning" 
          gradient="from-solar-warning/20 to-solar-warning/5" 
        />
        <StatCard 
          title="Assigned Users" 
          value={totalUsers} 
          icon={User} 
          color="text-solar-primary" 
          gradient="from-solar-primary/20 to-solar-panel/10" 
        />
        <StatCard 
          title="Current Power" 
          value={`${totalCurrentPower.toFixed(1)} W`} 
          icon={Sun} 
          color="text-solar-yellow" 
          gradient="from-solar-yellow/20 to-solar-orange/10" 
        />
        <StatCard 
          title="Today's Energy" 
          value={`${totalTodayEnergy.toFixed(1)} kWh`} 
          icon={Zap} 
          color="text-solar-orange" 
          gradient="from-solar-orange/20 to-solar-orange/5" 
        />
      </div>

      {/* Filters */}
      <div className="bg-solar-card rounded-lg p-4 energy-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-solar-muted" />
            <Input
              type="text"
              placeholder="Search devices by name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-solar-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 bg-solar-night/80 border border-solar-border rounded-lg px-3 text-solar-primary focus:outline-none focus:border-solar-yellow"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-solar-yellow border-t-transparent" />
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="bg-solar-card rounded-lg p-12 text-center">
          <Cpu className="w-16 h-16 mx-auto text-solar-muted mb-4" />
          <h3 className="text-xl font-semibold text-solar-primary mb-2">No Devices Found</h3>
          <p className="text-solar-muted">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-solar-card rounded-xl overflow-hidden energy-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-solar-night/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Device</th>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Type</th>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Location</th>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Power (Current/Today)</th>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Assigned To</th>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-solar-muted">Last Seen</th>
                  <th className="text-right p-4 text-sm font-semibold text-solar-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solar-border/50">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-solar-night/20 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${device.is_active ? 'bg-solar-yellow/20' : 'bg-solar-muted/20'}`}>
                          <Cpu className={`w-5 h-5 ${device.is_active ? 'text-solar-yellow' : 'text-solar-muted'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-solar-primary">{device.name}</p>
                          <p className="text-xs text-solar-muted">{device.device_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-solar-primary capitalize">{device.device_type || 'ESP32'}</td>
                    <td className="p-4 text-solar-primary">{device.location || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1" title="Current Power">
                          <Sun className="w-3 h-3 text-solar-yellow" />
                          <span className="text-sm text-solar-primary">{device.current_power?.toFixed(1) || 0}W</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Today's Energy">
                          <Zap className="w-3 h-3 text-solar-orange" />
                          <span className="text-sm text-solar-primary">{device.today_energy?.toFixed(2) || 0}kWh</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {device.assigned_to ? (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-solar-muted" />
                          <span className="text-solar-primary">{device.assigned_to_name || 'User'}</span>
                        </div>
                      ) : (
                        <span className="text-solar-muted">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${device.is_active ? 'bg-solar-success/20 text-solar-success' : 'bg-solar-warning/20 text-solar-warning'}`}>
                        {device.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-solar-muted text-sm">
                      {device.last_seen ? new Date(device.last_seen).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => fetchDevicePower(device)}
                          className="p-2 text-solar-primary hover:text-solar-yellow rounded-lg hover:bg-solar-panel/20 transition"
                          title="Power Details"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditDevice(device)}
                          className="p-2 text-solar-primary hover:text-solar-yellow rounded-lg hover:bg-solar-panel/20 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(device)}
                          className={`p-2 rounded-lg hover:bg-solar-panel/20 transition ${device.is_active ? 'text-solar-warning' : 'text-solar-success'}`}
                          title={device.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {device.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteDevice(device.id)}
                          className="p-2 text-solar-danger hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-solar-card rounded-xl p-6 w-full max-w-md border border-solar-border">
            <h2 className="text-xl font-bold text-solar-primary mb-4">Edit Device</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-solar-muted mb-1">Device Name</label>
                <Input 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-solar-muted mb-1">Location</label>
                <Input 
                  value={editForm.location} 
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} 
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="rounded border-solar-border bg-solar-night"
                  />
                  <span className="text-sm text-solar-primary">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={() => setShowEditModal(false)} className="bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</Button>
              <Button onClick={handleSaveEdit} className="bg-solar-yellow text-solar-dark hover:bg-solar-orange">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Power Details Modal */}
      {showPowerModal && powerDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-solar-card rounded-xl p-6 w-full max-w-lg border border-solar-border">
            <h2 className="text-xl font-bold text-solar-primary mb-4 flex items-center">
              <Power className="w-5 h-5 text-solar-yellow mr-2" />
              Device Power Details
            </h2>
            <div className="mb-4 p-3 bg-solar-night/30 rounded-lg">
              <p className="text-sm text-solar-muted">Device</p>
              <p className="text-lg font-semibold text-solar-primary">{powerDetails.device_name}</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-solar-night/30 rounded-lg p-4 text-center">
                  <Sun className="w-6 h-6 text-solar-yellow mx-auto mb-2" />
                  <p className="text-sm text-solar-muted">Current Power</p>
                  <p className="text-2xl font-bold text-solar-primary">{powerDetails.current_power?.toFixed(2) || 0} W</p>
                </div>
                <div className="bg-solar-night/30 rounded-lg p-4 text-center">
                  <Zap className="w-6 h-6 text-solar-orange mx-auto mb-2" />
                  <p className="text-sm text-solar-muted">Today's Energy</p>
                  <p className="text-2xl font-bold text-solar-primary">{powerDetails.today_energy?.toFixed(2) || 0} kWh</p>
                </div>
                <div className="bg-solar-night/30 rounded-lg p-4 text-center">
                  <Activity className="w-6 h-6 text-solar-success mx-auto mb-2" />
                  <p className="text-sm text-solar-muted">Peak Power</p>
                  <p className="text-2xl font-bold text-solar-primary">{powerDetails.peak_power?.toFixed(2) || 0} W</p>
                </div>
                <div className="bg-solar-night/30 rounded-lg p-4 text-center">
                  <Battery className="w-6 h-6 text-solar-success mx-auto mb-2" />
                  <p className="text-sm text-solar-muted">Avg Battery</p>
                  <p className="text-2xl font-bold text-solar-primary">{powerDetails.avg_battery?.toFixed(1) || 0}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-solar-night/30 rounded-lg p-3">
                  <p className="text-sm text-solar-muted">Average Power</p>
                  <p className="text-lg font-semibold text-solar-primary">{powerDetails.avg_power?.toFixed(2) || 0} W</p>
                </div>
                <div className="bg-solar-night/30 rounded-lg p-3">
                  <p className="text-sm text-solar-muted">Total Consumption</p>
                  <p className="text-lg font-semibold text-solar-primary">{powerDetails.total_consumption?.toFixed(2) || 0} kWh</p>
                </div>
              </div>
              <div className="bg-solar-yellow/10 rounded-lg p-3">
                <p className="text-sm text-solar-muted">System Efficiency</p>
                <p className="text-lg font-semibold text-solar-yellow">{powerDetails.efficiency?.toFixed(1) || 0}%</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-solar-muted">Status: {powerDetails.status}</span>
                <span className="text-sm text-solar-muted">Last Updated: {powerDetails.last_updated}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowPowerModal(false)} className="bg-solar-yellow text-solar-dark hover:bg-solar-orange">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
