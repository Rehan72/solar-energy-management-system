import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Battery, Zap, TrendingUp, LogOut, User, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../ui/stat-card'
import { getRequest, postRequest } from "../../lib/apiService"
import { notify } from "../../lib/toast"
import LivePowerDashboard from './LivePowerDashboard'
import WeatherWidget from '../WeatherWidget'
import FinancialWidget from './FinancialWidget'
import TicketList from './TicketList'
import NotificationBell from '../NotificationBell'

function UserDashboard() {
  const [energyData, setEnergyData] = useState({ solar: 0, load: 0, battery: 0, grid: 0 })
  const [prediction, setPrediction] = useState(null)
  const [weather, setWeather] = useState(null)
  const [financials, setFinancials] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
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

  const fetchFinancials = async () => {
    try {
      const response = await getRequest('/user/energy/financials');
      setFinancials(response.data);
    } catch (error) {
      console.error('Failed to fetch financials:', error);
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

  const fetchWeather = async (lat, lon) => {
    try {
      setLoadingWeather(true)
      const url = lat && lon ? `/user/weather?lat=${lat}&lon=${lon}` : '/user/weather'
      const response = await getRequest(url)
      setWeather(response.data)
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setLoadingWeather(false)
    }
  }

  const handleLogout = () => {
    notify.success('Logged out successfully');
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const refreshData = () => {
    fetchEnergyData()
    fetchPrediction()
    fetchFinancials()
    if (user?.latitude && user?.longitude) {
      fetchWeather(user.latitude, user.longitude)
    } else {
      fetchWeather()
    }
  }

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    setUser(userData)
    fetchEnergyData()
    fetchPrediction()
    fetchFinancials()
    if (userData?.latitude && userData?.longitude) {
      fetchWeather(userData.latitude, userData.longitude)
    } else {
      fetchWeather()
    }

    const interval = setInterval(() => {
      fetchEnergyData()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Sample chart data - in a real app, this would come from the API
  const chartData = [
    { time: '00:00', solar: 0, load: 1.2, battery: 85 },
    { time: '06:00', solar: 0.5, load: 1.8, battery: 82 },
    { time: '12:00', solar: 4.2, load: 3.1, battery: 78 },
    { time: '18:00', solar: 1.8, load: 2.5, battery: 75 },
    { time: '24:00', solar: 0, load: 1.5, battery: 72 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-solar-bg"
    >
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
              <NotificationBell />
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
            index={0}
            title="Solar Generation"
            value={`${energyData.solar} kW`}
            icon={Sun}
            color="text-solar-yellow"
            gradient="from-solar-yellow/20 to-solar-orange/10"
          />

          <StatCard
            index={1}
            title="Load Consumption"
            value={`${energyData.load} kW`}
            icon={Zap}
            color="text-solar-orange"
            gradient="from-solar-orange/20 to-solar-orange/5"
          />

          <StatCard
            index={2}
            title="Battery Level"
            value={`${energyData.battery}%`}
            icon={Battery}
            color="text-solar-success"
            gradient="from-solar-success/20 to-solar-success/5"
          />

          <StatCard
            index={3}
            title="Grid Power"
            value={`${energyData.grid} kW`}
            color={energyData.grid >= 0 ? "text-solar-yellow" : "text-solar-orange"}
            gradient={energyData.grid >= 0 ? "from-solar-yellow/20 to-solar-yellow/5" : "from-solar-orange/20 to-solar-orange/5"}
          />
        </div>

        {/* Financials & AI & Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Financial Widget (Takes up 1 column on LG) */}
          {financials && <FinancialWidget data={financials} />}

          {/* AI Prediction (Takes up 1 column or adjusts) */}
          {prediction && (
            <div className="solar-glass rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-solar-primary flex items-center">
                    <TrendingUp className="h-5 w-5 text-solar-yellow mr-2" />
                    AI Prediction
                  </h3>
                  <p className="text-sm text-solar-muted">Tomorrow's generation</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-solar-yellow">
                    {prediction.tomorrow_prediction_kw || prediction.prediction_kw} kW
                  </p>
                  <p className="text-sm text-solar-muted">AI Model v1.0</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-solar-border/30">
                <p className="text-xs text-solar-muted italic">
                  * Based on {prediction.fallback ? 'historical avg' : 'weather forecast'}.
                </p>
              </div>
            </div>
          )}

          <WeatherWidget weather={weather} loading={loadingWeather} />
        </div>

        {/* Middle Section: Tickets and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Tickets Section (Taking 1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <TicketList role={user?.role} />
          </div>

          {/* Charts taking 2/3 width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 solar-glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-solar-primary mb-6 flex items-center">
              <Zap className="w-5 h-5 text-solar-yellow mr-2" />
              Energy Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4A261" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F4A261" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="solar" stroke="#FFD166" strokeWidth={3} fillOpacity={1} fill="url(#colorSolar)" name="Solar (kW)" />
                <Area type="monotone" dataKey="load" stroke="#F4A261" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" name="Load (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Live Power Dashboard */}
        < div className="mt-8" >
          <h3 className="text-lg font-semibold text-solar-primary mb-4">Live Power Monitoring</h3>
          <LivePowerDashboard />
        </div >

        {/* System Status */}
        < div className="mt-8 solar-glass rounded-2xl p-6" >
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
        </div >
      </main >
    </motion.div >
  )
}

export default UserDashboard