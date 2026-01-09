import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Sun, Zap, Battery, TrendingUp, RefreshCw, DollarSign, Leaf, BarChart3 } from 'lucide-react'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import StatCard from '../../components/ui/stat-card'

export default function EnergyAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [analyticsRes, historyRes] = await Promise.all([
        getRequest('/user/energy/analytics'),
        getRequest('/user/energy/history', { days: period })
      ])
      setAnalytics(analyticsRes.data.analytics)
      setHistory(formattedHistory)
    } catch (error) {
      console.error('Failed to fetch energy analytics:', error)
      notify.error('Failed to load energy analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [period])

  // Sample data when API is not available
  const sampleChartData = [
    { time: 'Mon', solar: 4.2, load: 3.1, battery: 85 },
    { time: 'Tue', solar: 3.8, load: 2.9, battery: 82 },
    { time: 'Wed', solar: 4.5, load: 3.4, battery: 88 },
    { time: 'Thu', solar: 3.2, load: 2.8, battery: 79 },
    { time: 'Fri', solar: 4.8, load: 3.6, battery: 91 },
    { time: 'Sat', solar: 3.9, load: 2.5, battery: 86 },
    { time: 'Sun', solar: 4.1, load: 2.7, battery: 84 },
  ]

  const chartData = history.length > 0 ? history : sampleChartData

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Energy Analytics</h1>
          <p className="text-solar-muted mt-1">Track your solar energy performance and savings</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={period} 
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="h-10 bg-solar-card text-solar-primary border border-solar-border rounded-lg px-3"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button 
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Energy Generated"
          value={analytics?.generated?.total ? `${analytics.generated.total.toFixed(1)} kWh` : '156.2 kWh'}
          icon={Sun}
          color="text-solar-yellow"
          gradient="from-solar-yellow/20 to-solar-orange/10"
        />
        <StatCard
          title="Energy Consumed"
          value={analytics?.consumed?.total ? `${analytics.consumed.total.toFixed(1)} kWh` : '98.4 kWh'}
          icon={Zap}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Savings"
          value={analytics?.savings?.estimatedSavings ? `₹${analytics.savings.estimatedSavings.toFixed(0)}` : '₹1,250'}
          icon={DollarSign}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="CO₂ Reduced"
          value={analytics?.savings?.co2Reduction ? `${analytics.savings.co2Reduction.toFixed(1)} kg` : '109.3 kg'}
          icon={Leaf}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-primary/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Energy Generation vs Consumption */}
        <div className="bg-solar-card rounded-xl p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-solar-yellow mr-2" />
            Generation vs Consumption
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Area type="monotone" dataKey="solar" stroke="#FFD166" fill="#FFD166" fillOpacity={0.3} name="Solar (kW)" />
              <Area type="monotone" dataKey="load" stroke="#F4A261" fill="#F4A261" fillOpacity={0.3} name="Load (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Battery Level Trends */}
        <div className="bg-solar-card rounded-xl p-6 energy-card">
          <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
            <Battery className="w-5 h-5 text-solar-success mr-2" />
            Battery Level Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="battery" stroke="#2ECC71" strokeWidth={3} dot={{ fill: '#2ECC71' }} name="Battery (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-solar-card rounded-xl p-6 energy-card">
        <h3 className="text-lg font-semibold text-solar-primary mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 text-solar-yellow mr-2" />
          Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-solar-night/30 rounded-lg">
            <p className="text-sm text-solar-muted mb-1">Average Daily Generation</p>
            <p className="text-2xl font-bold text-solar-yellow">{analytics?.generated?.average?.toFixed(1) || '22.3'} kWh</p>
          </div>
          <div className="text-center p-4 bg-solar-night/30 rounded-lg">
            <p className="text-sm text-solar-muted mb-1">Peak Generation</p>
            <p className="text-2xl font-bold text-solar-success">{analytics?.generated?.max?.toFixed(1) || '4.8'} kW</p>
          </div>
          <div className="text-center p-4 bg-solar-night/30 rounded-lg">
            <p className="text-sm text-solar-muted mb-1">Net Export to Grid</p>
            <p className="text-2xl font-bold text-solar-primary">{analytics?.gridExport?.total?.toFixed(1) || '57.8'} kWh</p>
          </div>
        </div>
      </div>
    </div>
  )
}
