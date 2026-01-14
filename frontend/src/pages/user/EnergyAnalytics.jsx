import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Sun, Zap, Battery, TrendingUp, RefreshCw, DollarSign, Leaf, BarChart3 } from 'lucide-react'
import { getRequest } from '../../lib/apiService'
import { notify } from '../../lib/toast'
import StatCard from '../../components/ui/stat-card'

export default function EnergyAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [history, setHistory] = useState([])
  const [period, setPeriod] = useState(7)

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, historyRes] = await Promise.all([
        getRequest('/user/energy/analytics'),
        getRequest('/user/energy/history', { days: period })
      ])
      setAnalytics(analyticsRes.data.analytics)
      setHistory(historyRes.data.history || [])
    } catch (error) {
      console.error('Failed to fetch energy analytics:', error)
      notify.error('Telemetry failure: Unable to synchronize energy metrics.')
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Energy Intelligence</h1>
          <p className="text-solar-muted mt-1 font-medium italic">Advanced telemetry analysis of photovoltaic yield and consumption vectors.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={period} 
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="solar-input h-11 min-w-[180px]"
          >
            <option value={7}>Septenary Cycle (7D)</option>
            <option value={30}>Lunar Cycle (30D)</option>
            <option value={90}>Trimester Phase (90D)</option>
          </select>
          <button 
            onClick={fetchData}
            className="p-3 solar-glass rounded-xl hover:bg-solar-panel/20 transition-all border border-solar-border/30 group"
            title="Telemetry Synchronize"
          >
            <RefreshCw className="w-5 h-5 text-solar-primary group-hover:rotate-180 transition-transform duration-700" />
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
        <div className="solar-glass rounded-3xl p-8 border-solar-panel/10 group">
          <h3 className="text-xs font-black text-solar-primary mb-8 flex items-center tracking-tight uppercase italic decoration-solar-yellow decoration-2 underline-offset-4 underline">
            <TrendingUp className="w-4 h-4 mr-3 text-solar-yellow" />
            Spectral Flux Analysis
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFD166" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4A261" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F4A261" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} fontWeight="900" tick={{ fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} fontWeight="900" tick={{ fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#F3F4F6', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                labelStyle={{ color: '#FFD166', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Area type="monotone" dataKey="solar" stroke="#FFD166" strokeWidth={3} fillOpacity={1} fill="url(#colorSolar)" name="Generation (kW)" />
              <Area type="monotone" dataKey="load" stroke="#F4A261" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" name="Consumption (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Battery Level Trends */}
        <div className="solar-glass rounded-3xl p-8 border-solar-panel/10 group">
          <h3 className="text-xs font-black text-solar-primary mb-8 flex items-center tracking-tight uppercase italic decoration-solar-success decoration-2 underline-offset-4 underline">
            <Battery className="w-4 h-4 mr-3 text-solar-success" />
            Potential Storage Lifecycle
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} fontWeight="900" tick={{ fill: '#ffffff40' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} fontWeight="900" tick={{ fill: '#ffffff40' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#F3F4F6', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                labelStyle={{ color: '#2ECC71', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Line type="monotone" dataKey="battery" stroke="#2ECC71" strokeWidth={4} dot={{ fill: '#2ECC71', r: 4, strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="Potential (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="solar-glass rounded-3xl p-8 border-solar-panel/10 group overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <BarChart3 className="w-32 h-32 text-solar-yellow" />
        </div>
        <h3 className="text-xs font-black text-solar-primary mb-8 flex items-center tracking-tight uppercase italic decoration-solar-primary decoration-2 underline-offset-4 underline">
          <BarChart3 className="w-4 h-4 mr-3 text-solar-yellow" />
          Aggregate Operational Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="text-center p-6 solar-glass bg-solar-night/20 rounded-2xl border-solar-border/10">
            <p className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-3">Mean Diurnal Yield</p>
            <p className="text-3xl font-black text-solar-yellow tracking-tighter">{analytics?.generated?.average?.toFixed(1) || '22.3'} <span className="text-xs font-bold text-solar-muted uppercase">kWh</span></p>
          </div>
          <div className="text-center p-6 solar-glass bg-solar-night/20 rounded-2xl border-solar-border/10">
            <p className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-3">Zenith Power Pulse</p>
            <p className="text-3xl font-black text-solar-success tracking-tighter">{analytics?.generated?.max?.toFixed(1) || '4.8'} <span className="text-xs font-bold text-solar-muted uppercase">kW</span></p>
          </div>
          <div className="text-center p-6 solar-glass bg-solar-night/20 rounded-2xl border-solar-border/10">
            <p className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] mb-3">Net Grid Propagation</p>
            <p className="text-3xl font-black text-solar-primary tracking-tighter">{analytics?.gridExport?.total?.toFixed(1) || '57.8'} <span className="text-xs font-bold text-solar-muted uppercase">kWh</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
