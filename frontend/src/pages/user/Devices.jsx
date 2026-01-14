import { useState, useEffect } from 'react'
import { Cpu, Plus, RefreshCw, Trash2, Edit, Wifi, WifiOff, Power, PowerOff, Zap, Sun, Battery, Activity, Shield, MapPin, Globe } from 'lucide-react'
import SunLoader from '../../components/SunLoader'
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
  const [showPowerModal, setShowPowerModal] = useState(false)
  const [powerDetails, setPowerDetails] = useState(null)

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
      await postRequest('/user/devices', newDevice)
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

  const fetchDevicePower = async (device) => {
    try {
      const response = await getRequest(`/user/devices/${device.id}/power`)
      setPowerDetails(response.data)
      setShowPowerModal(true)
    } catch {
      notify.error('Failed to fetch power details')
    }
  }

  const activeDevices = devices.filter(d => d.is_active).length
  const inactiveDevices = devices.filter(d => !d.is_active).length

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Hardware Nexus</h1>
          <p className="text-solar-muted mt-1 font-medium italic">Monitoring and management of decentralized sensor nodes.</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={fetchDevices} 
            className="p-2.5 solar-glass rounded-xl hover:bg-solar-panel/20 transition-all border border-solar-border/30 group"
            title="Registry Sync"
          >
            <RefreshCw className="w-5 h-5 text-solar-primary group-hover:rotate-180 transition-transform duration-700" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="sun-button px-6 py-2.5"
          >
            <div className="flex items-center space-x-2 font-black uppercase tracking-tight">
              <Plus className="w-5 h-5" />
              <span>Initialize Node</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Devices" value={devices.length} icon={Cpu} color="text-solar-yellow" gradient="from-solar-yellow/20 to-solar-orange/10" />
        <StatCard title="Active" value={activeDevices} icon={Wifi} color="text-solar-success" gradient="from-solar-success/20 to-solar-success/5" />
        <StatCard title="Inactive" value={inactiveDevices} icon={WifiOff} color="text-solar-warning" gradient="from-solar-warning/20 to-solar-warning/5" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 solar-glass rounded-3xl">
          <SunLoader message="Synchronizing hardware telemetry..." />
        </div>
      ) : devices.length === 0 ? (
        <div className="solar-glass rounded-3xl p-20 text-center border-solar-panel/10 group">
          <div className="w-24 h-24 bg-solar-panel/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-solar-border/30 group-hover:scale-110 transition-transform duration-500">
            <Cpu className="w-12 h-12 text-solar-muted group-hover:text-solar-yellow transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-solar-primary mb-3 uppercase tracking-tight">Zero Node Coverage</h3>
          <p className="text-solar-muted mb-10 font-medium italic">Initialize your first monitoring interceptor to begin telemetry capture.</p>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="sun-button px-10 py-3"
          >
            Deploy First Interceptor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {devices.map((device) => (
            <div 
              key={device.id} 
              className={`solar-glass rounded-3xl p-8 border border-solar-border/30 group transition-all duration-500 ${!device.is_active && 'opacity-60 grayscale'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${device.is_active ? 'bg-linear-to-br from-solar-panel/20 to-solar-yellow/10 border-solar-yellow/30 shadow-[0_0_20px_rgba(255,209,102,0.1)]' : 'bg-solar-muted/10 border-solar-border/30'}`}>
                    <Cpu className={`w-7 h-7 ${device.is_active ? 'text-solar-yellow group-hover:scale-110 transition-transform' : 'text-solar-muted'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-solar-primary uppercase tracking-tight">{device.name}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                       <span className="text-[10px] font-black text-solar-yellow uppercase tracking-widest px-2 py-0.5 bg-solar-yellow/10 rounded-md">{device.device_type}</span>
                       {device.location && (
                         <div className="flex items-center text-[10px] font-bold text-solar-muted uppercase">
                           <MapPin className="w-3 h-3 mr-1" />
                           {device.location}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${device.is_active ? 'bg-solar-success/10 text-solar-success border-solar-success/30' : 'bg-solar-danger/10 text-solar-danger border-solar-danger/30'}`}>
                   {device.is_active ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Power Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="solar-glass bg-solar-night/20 rounded-2xl p-4 border-solar-border/20 group-hover:bg-solar-night/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Sun className="w-4 h-4 text-solar-yellow" />
                    <span className="text-[8px] font-black text-solar-muted uppercase tracking-widest">Flux</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-black text-solar-primary">{device.current_power || 0}</span>
                    <span className="text-[10px] font-bold text-solar-muted uppercase">W</span>
                  </div>
                </div>
                <div className="solar-glass bg-solar-night/20 rounded-2xl p-4 border-solar-border/20 group-hover:bg-solar-night/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-4 h-4 text-solar-orange" />
                    <span className="text-[8px] font-black text-solar-muted uppercase tracking-widest">Accum</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-black text-solar-primary">{device.today_energy || 0}</span>
                    <span className="text-[10px] font-bold text-solar-muted uppercase">kWh</span>
                  </div>
                </div>
                <div className="solar-glass bg-solar-night/20 rounded-2xl p-4 border-solar-border/20 group-hover:bg-solar-night/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Battery className="w-4 h-4 text-solar-success" />
                    <span className="text-[8px] font-black text-solar-muted uppercase tracking-widest">Charge</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-black text-solar-primary">{device.avg_battery || 0}</span>
                    <span className="text-[10px] font-bold text-solar-muted uppercase">%</span>
                  </div>
                </div>
                <div className="solar-glass bg-solar-night/20 rounded-2xl p-4 border-solar-border/20 group-hover:bg-solar-night/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-4 h-4 text-solar-primary" />
                    <span className="text-[8px] font-black text-solar-muted uppercase tracking-widest">Peak</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-black text-solar-primary">{device.peak_power || 0}</span>
                    <span className="text-[10px] font-bold text-solar-muted uppercase">W</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-solar-border/20">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => fetchDevicePower(device)} 
                    className="p-3 solar-glass bg-solar-panel/10 rounded-xl hover:bg-solar-panel/30 transition-all border border-solar-border/30 group/btn" 
                    title="Analyze Power Stream"
                  >
                    <Activity className="w-5 h-5 text-solar-primary group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleToggleActive(device)} 
                    className={`p-3 solar-glass rounded-xl transition-all border border-solar-border/30 group/btn ${device.is_active ? 'bg-solar-danger/10 hover:bg-solar-danger/20 border-solar-danger/30' : 'bg-solar-success/10 hover:bg-solar-success/20 border-solar-success/30'}`}
                    title={device.is_active ? 'Decommission Node' : 'Initialize Node'}
                  >
                    {device.is_active ? <PowerOff className="w-5 h-5 text-solar-danger group-hover/btn:rotate-12 transition-transform" /> : <Power className="w-5 h-5 text-solar-success group-hover/btn:scale-110 transition-transform" />}
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteDevice(device.id)} 
                  className="p-3 solar-glass bg-solar-danger/10 rounded-xl hover:bg-solar-danger/20 transition-all border border-solar-danger/30 group/btn"
                  title="Wipe Registry Record"
                >
                  <Trash2 className="w-5 h-5 text-solar-danger group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-solar-bg/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="solar-glass rounded-3xl p-10 w-full max-w-lg border border-solar-border/30 relative overflow-hidden group/modal">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Plus className="w-24 h-24 text-solar-yellow" />
            </div>
            <h2 className="text-2xl font-black text-solar-primary mb-8 flex items-center tracking-tight uppercase">
              <Shield className="w-6 h-6 mr-3 text-solar-yellow" />
              Initialize Interceptor
            </h2>
            <div className="space-y-8 relative z-10">
              <div>
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-3 block">Node System Designation</label>
                <input 
                  type="text"
                  value={newDevice.name} 
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} 
                  className="solar-input"
                  placeholder="e.g., Primary Array Monitor" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-3 block">Hardware Architecture</label>
                <select 
                  value={newDevice.device_type} 
                  onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })} 
                  className="solar-input"
                >
                  <option value="esp32">ESP32 Core Precision</option>
                  <option value="esp8266">ESP8266 Legacy Node</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-3 block">Deployment Sector</label>
                <input 
                  type="text"
                  value={newDevice.location} 
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })} 
                  className="solar-input"
                  placeholder="e.g., Roof Quadrant A" 
                />
              </div>
            </div>
            <div className="flex justify-end space-x-6 mt-12 pt-6 border-t border-solar-border/20">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-xs font-black text-solar-muted uppercase tracking-widest hover:text-solar-primary transition-colors underline underline-offset-8 decoration-solar-border/50 hover:decoration-solar-yellow"
              >
                Abort Protocol
              </button>
              <button 
                onClick={handleAddDevice} 
                disabled={!newDevice.name} 
                className="sun-button px-10 py-3 disabled:opacity-50"
              >
                Initialize Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Power Details Modal */}
      {showPowerModal && powerDetails && (
        <div className="fixed inset-0 bg-solar-bg/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="solar-glass rounded-3xl p-10 w-full max-w-2xl border border-solar-border/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity className="w-32 h-32 text-solar-primary" />
            </div>
            <h2 className="text-2xl font-black text-solar-primary mb-8 flex items-center tracking-tight uppercase">
              <Activity className="w-6 h-6 mr-3 text-solar-yellow" />
              Node Telemetry Stream
            </h2>
            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="solar-glass bg-solar-panel/10 rounded-2xl p-6 text-center border-solar-yellow/20">
                  <Sun className="w-6 h-6 text-solar-yellow mx-auto mb-3" />
                  <p className="text-[8px] font-black text-solar-muted uppercase tracking-widest mb-1">Instant Flux</p>
                  <p className="text-2xl font-black text-solar-primary tracking-tighter">{powerDetails.current_power?.toFixed(2) || 0}<span className="text-xs ml-1 font-bold text-solar-muted">W</span></p>
                </div>
                <div className="solar-glass bg-solar-panel/10 rounded-2xl p-6 text-center border-solar-orange/20">
                  <Zap className="w-6 h-6 text-solar-orange mx-auto mb-3" />
                  <p className="text-[8px] font-black text-solar-muted uppercase tracking-widest mb-1">Accumulated</p>
                  <p className="text-2xl font-black text-solar-primary tracking-tighter">{powerDetails.today_energy?.toFixed(2) || 0}<span className="text-xs ml-1 font-bold text-solar-muted">kWh</span></p>
                </div>
                <div className="solar-glass bg-solar-panel/10 rounded-2xl p-6 text-center border-solar-primary/20">
                  <Activity className="w-6 h-6 text-solar-primary mx-auto mb-3" />
                  <p className="text-[8px] font-black text-solar-muted uppercase tracking-widest mb-1">Peak Pulse</p>
                  <p className="text-2xl font-black text-solar-primary tracking-tighter">{powerDetails.peak_power?.toFixed(2) || 0}<span className="text-xs ml-1 font-bold text-solar-muted">W</span></p>
                </div>
                <div className="solar-glass bg-solar-panel/10 rounded-2xl p-6 text-center border-solar-success/20">
                  <Battery className="w-6 h-6 text-solar-success mx-auto mb-3" />
                  <p className="text-[8px] font-black text-solar-muted uppercase tracking-widest mb-1">Potential</p>
                  <p className="text-2xl font-black text-solar-primary tracking-tighter">{powerDetails.avg_battery?.toFixed(1) || 0}<span className="text-xs ml-1 font-bold text-solar-muted">%</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="solar-glass rounded-2xl p-5 border-solar-border/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Mean Power Flux</span>
                    <span className="text-sm font-black text-solar-primary">{powerDetails.avg_power?.toFixed(2) || 0} W</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Total Energy Propagated</span>
                    <span className="text-sm font-black text-solar-primary">{powerDetails.total_consumption?.toFixed(2) || 0} kWh</span>
                  </div>
                </div>
                
                <div className="solar-glass rounded-2xl p-5 bg-linear-to-br from-solar-yellow/10 to-transparent border-solar-yellow/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-solar-yellow uppercase tracking-widest">Spectral Efficiency</span>
                    <span className="text-lg font-black text-solar-yellow">{powerDetails.efficiency?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-solar-muted/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-solar-yellow shadow-[0_0_10px_rgba(255,209,102,0.5)] transition-all duration-1000" 
                      style={{ width: `${powerDetails.efficiency || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-solar-border/20">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${powerDetails.status === 'ACTIVE' ? 'bg-solar-success animate-pulse' : 'bg-solar-danger'}`} />
                    <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest">Status: {powerDetails.status}</span>
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="w-3 h-3 text-solar-muted mr-2" />
                    <span className="text-[10px] font-black text-solar-muted uppercase tracking-widest italic truncate max-w-[150px]">Last Sync: {powerDetails.last_updated}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPowerModal(false)} 
                  className="sun-button px-12 py-3"
                >
                  Terminate Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
