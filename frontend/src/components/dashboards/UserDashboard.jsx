import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Sun, Battery, Zap, TrendingUp, LogOut, User, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../ui/stat-card'
import { getRequest, postRequest } from '../../lib/apiService'

function UserDashboard() {
  const [energyData, setEnergyData] = useState({ solar: 0, load: 0, battery: 0, grid: 0 })
  const [prediction, setPrediction] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const fetchEnergyData = async () => {
    try {
      const response = await getRequest('/user/energy/current')
      setEnergyData(response.data)
    } catch (error) {
      console.error('Failed to fetch energy data:', error)
    }
  }

  const fetchPrediction = async () => {
    try {
      const response = await postRequest('/user/energy/predict', {})
      setPrediction(response.data)
    } catch (error) {
      console.error('Failed to fetch prediction:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const refreshData = () => {
    fetchEnergyData()
    fetchPrediction()
  }

  // Sample chart data - in a real app, this would come from the API
  const chartData = [
    { time: '00:00', solar: 0, load: 1.2, battery: 85 },
    { time: '06:00', solar: 0.5, load: 1.8, battery: 82 },
    { time: '12:00', solar: 4.2, load: 3.1, battery: 78 },
    { time: '18:00', solar: 1.8, load: 2.5, battery: 75 },
    { time: '24:00', solar: 0, load: 1.5, battery: 72 },
  ]

  return (
    <div className="min-h-screen bg-solar-bg">
      {/* Header */}
      <header className="bg-solar-card/80 backdrop-blur-md shadow-sm border-b border-solar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold sun-glow-text">SEMS Dashboard</h1>
              <button
                onClick={refreshData}
                className="p-2 text-solar-muted hover:text-solar-yellow rounded-full hover:bg-solar-panel/20 transition sun-button"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-solar-muted">
                <User className="w-4 h-4" />
                <span>{user?.email || 'User'}</span>
                <span className="px-2 py-1 bg-solar-yellow text-solar-dark font-semibold rounded-full text-xs">
                  {user?.role || 'USER'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-solar-yellow hover:text-solar-yellow hover:bg-solar-panel/20 rounded-md transition sun-button"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Energy Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Solar Generation"
            value={`${energyData.solar} kW`}
            icon={Sun}
            color="text-solar-yellow"
            gradient="from-solar-yellow/20 to-solar-orange/10"
          />

          <StatCard
            title="Load Consumption"
            value={`${energyData.load} kW`}
            icon={Zap}
            color="text-solar-orange"
            gradient="from-solar-orange/20 to-solar-orange/5"
          />

          <StatCard
            title="Battery Level"
            value={`${energyData.battery}%`}
            icon={Battery}
            color="text-solar-success"
            gradient="from-solar-success/20 to-solar-success/5"
          />

          <StatCard
            title="Grid Power"
            value={`${energyData.grid} kW`}
            icon={TrendingUp}
            color={energyData.grid >= 0 ? "text-solar-yellow" : "text-solar-orange"}
            gradient={energyData.grid >= 0 ? "from-solar-yellow/20 to-solar-yellow/5" : "from-solar-orange/20 to-solar-orange/5"}
          />
        </div>

        {/* AI Prediction */}
        {prediction && (
          <div className="bg-solar-card rounded-lg shadow p-6 mb-8 energy-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-solar-primary flex items-center">
                  <TrendingUp className="h-5 w-5 text-solar-yellow mr-2" />
                  AI Solar Prediction
                </h3>
                <p className="text-sm text-solar-muted">Tomorrow's expected solar generation</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-solar-yellow">
                  {prediction.tomorrow_prediction_kw || prediction.prediction_kw} kW
                </p>
                <p className="text-sm text-solar-muted">AI Model v1.0</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Energy Flow Chart */}
          <div className="bg-solar-card rounded-lg shadow p-6 energy-card">
            <h3 className="text-lg font-semibold text-solar-primary mb-4">Energy Generation & Consumption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="solar" stroke="#FFD166" strokeWidth={2} name="Solar (kW)" />
                <Line type="monotone" dataKey="load" stroke="#F4A261" strokeWidth={2} name="Load (kW)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Battery Trends Chart */}
          <div className="bg-solar-card rounded-lg shadow p-6 energy-card">
            <h3 className="text-lg font-semibold text-solar-primary mb-4">Battery Level Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="battery" fill="#2ECC71" name="Battery (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-solar-card rounded-lg shadow p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-solar-success rounded-full animate-pulse"></div>
              <span className="text-sm text-solar-muted">Backend API: Online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-solar-success rounded-full animate-pulse"></div>
              <span className="text-sm text-solar-muted">AI Service: Online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-solar-yellow rounded-full animate-pulse"></div>
              <span className="text-sm text-solar-muted">ESP32 Devices: 1 Connected</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserDashboard