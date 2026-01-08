import { useState, useEffect } from 'react'
import { Cpu, Plus, RefreshCw, Trash2, Edit, Key, Wifi, WifiOff, Power, PowerOff } from 'lucide-react'
import { getRequest, postRequest, deleteRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import StatCard from '../../components/ui/stat-card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDevice, setNewDevice] = useState({ name: '', device_type: 'esp32', location: '' })
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', location: '', is_active: true })

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await getRequest('/user/devices')
      setDevices(response.data.devices || [])
    } catch {
      notify.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDevices() }, [])

  const handleAddDevice = async () => {
    try {
      await postRequest('/installer/devices', newDevice)
      notify.success('Device created successfully')
      setShowAddModal(false)
      setNewDevice({ name: '', device_type: 'esp32', location: '' })
      fetchDevices()
    } catch { notify.error('Failed to create device') }
  }

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return
    try {
      await deleteRequest(`/user/devices/${deviceId}`)
      notify.success('Device deleted successfully')
      fetchDevices()
    } catch { notify.error('Failed to delete device') }
  }

  const handleToggleActive = async (device) => {
    try {
      await getRequest(`/user/devices/${device.id}`, {}, { method: 'PUT', data: { is_active: !device.is_active } })
      notify.success(`Device ${device.is_active ? 'deactivated' : 'activated'}`)
      fetchDevices()
    } catch { notify.error('Failed to update device status') }
  }

  const activeDevices = devices.filter(d => d.is_active).length
  const inactiveDevices = devices.filter(d => !d.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">My Devices</h1>
          <p className="text-solar-muted mt-1">Manage your solar monitoring devices</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchDevices} className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button">
            <RefreshCw className="w-4 h-4" /><span>Refresh</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button">
            <Plus className="w-4 h-4" /><span>Add Device</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Devices" value={devices.length} icon={Cpu} color="text-solar-yellow" gradient="from-solar-yellow/20 to-solar-orange/10" />
        <StatCard title="Active" value={activeDevices} icon={Wifi} color="text-solar-success" gradient="from-solar-success/20 to-solar-success/5" />
        <StatCard title="Inactive" value={inactiveDevices} icon={WifiOff} color="text-solar-warning" gradient="from-solar-warning/20 to-solar-warning/5" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-solar-yellow border-t-transparent" />
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-solar-card rounded-lg p-12 text-center">
          <Cpu className="w-16 h-16 mx-auto text-solar-muted mb-4" />
          <h3 className="text-xl font-semibold text-solar-primary mb-2">No Devices Yet</h3>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition">Add Your First Device</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div key={device.id} className={`bg-solar-card rounded-xl p-6 border ${device.is_active ? 'border-solar-border/50 hover:border-solar-yellow/50' : 'border-solar-border/30 opacity-75'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${device.is_active ? 'bg-solar-yellow/20' : 'bg-solar-muted/20'}`}>
                    <Cpu className={`w-6 h-6 ${device.is_active ? 'text-solar-yellow' : 'text-solar-muted'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-solar-primary">{device.name}</h3>
                    <p className="text-sm text-solar-muted capitalize">{device.device_type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${device.is_active ? 'bg-solar-success/20 text-solar-success' : 'bg-solar-warning/20 text-solar-warning'}`}>
                  {device.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-solar-border/50">
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedDevice(device); setEditForm({ name: device.name, location: device.location, is_active: device.is_active }); setShowEditModal(true); }} className="p-2 text-solar-primary hover:text-solar-yellow rounded-lg hover:bg-solar-panel/20 transition">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleActive(device)} className={`p-2 rounded-lg hover:bg-solar-panel/20 transition ${device.is_active ? 'text-solar-warning' : 'text-solar-success'}`}>
                    {device.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={() => handleDeleteDevice(device.id)} className="p-2 text-solar-danger hover:text-red-400 rounded-lg hover:bg-red-500/10 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-solar-card rounded-xl p-6 w-full max-w-md border border-solar-border">
            <h2 className="text-xl font-bold text-solar-primary mb-4">Add New Device</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-solar-muted mb-1">Device Name</label>
                <Input value={newDevice.name} onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} placeholder="e.g., Solar Panel Monitor" />
              </div>
              <div>
                <label className="block text-sm font-medium text-solar-muted mb-1">Device Type</label>
                <select value={newDevice.device_type} onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })} className="w-full h-10 bg-solar-dark/50 text-solar-primary border border-solar-border rounded-lg px-3">
                  <option value="esp32">ESP32</option>
                  <option value="esp8266">ESP8266</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-solar-muted mb-1">Location</label>
                <Input value={newDevice.location} onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })} placeholder="e.g., Roof Top" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={() => setShowAddModal(false)} className="bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</Button>
              <Button onClick={handleAddDevice} disabled={!newDevice.name} className="bg-solar-yellow text-solar-dark hover:bg-solar-orange">Add Device</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
