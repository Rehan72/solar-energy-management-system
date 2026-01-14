import { useState } from 'react'
import { Download, FileText, BarChart3, TrendingUp, Users, Zap, DollarSign, Calendar } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'
import { getRequest } from '../../lib/apiService'

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('month')
  const role = localStorage.getItem('role') || 'USER'

  const reports = [
    { id: 'overview', name: 'System Overview', icon: BarChart3, description: 'Complete system performance summary' },
    { id: 'energy', name: 'Energy Generation', icon: Zap, description: 'Solar energy generation reports' },
    { id: 'users', name: 'User Analysis', icon: Users, description: 'User growth and engagement metrics', roles: ['SUPER_ADMIN'] },
    { id: 'plants', name: 'Solar Plants', icon: Zap, description: 'Solar plant inventory and status', roles: ['SUPER_ADMIN'] },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Financial performance and revenue', roles: ['SUPER_ADMIN'] },
  ].filter(r => !r.roles || r.roles.includes(role))

  const sampleData = {
    overview: {
      totalEnergy: '24,456 kWh',
      totalUsers: 1250,
      totalRevenue: '₹4.8L',
      growth: '+12.5%',
    },
    energy: {
      peakGeneration: '4.8 kW',
      avgDaily: '22.3 kWh',
      efficiency: '94.2%',
      co2Saved: '156.8 tons',
    },
    users: {
      newUsers: 145,
      activeUsers: 890,
      installations: 78,
      satisfaction: '4.8/5',
    },
    revenue: {
      total: '₹4,85,000',
      avgPerUser: '₹388',
      growth: '+8.3%',
      projections: '₹6.2L',
    }
  }

  const data = sampleData[selectedReport] || sampleData.overview

  const handleDownload = async (reportType, format = 'excel') => {
    try {
      notify.success(`Preparing ${reportType} report in ${format} format...`)

      let endpoint = ''
      let filename = `${reportType}_report.${format === 'csv' ? 'csv' : 'xlsx'}`

      switch (reportType) {
        case 'users':
          endpoint = `/superadmin/reports/users/export?format=${format}`
          break
        case 'energy':
          endpoint = `/user/reports/energy/export?format=${format}&days=${dateRange === 'month' ? 30 : dateRange === 'week' ? 7 : 90}`
          break
        case 'overview':
          // For now, overview might just be a combination or not implemented for export
          notify.error('Overview report export not yet implemented')
          return
        case 'revenue':
          notify.error('Revenue report export not yet implemented')
          return
        default:
          endpoint = `/superadmin/reports/plants/export?format=${format}`
      }

      const response = await getRequest(endpoint, { responseType: 'blob' })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()

      notify.success(`${reportType} report downloaded successfully`)
    } catch (error) {
      console.error('Download failed:', error)
      notify.error('Failed to download report')
    }
  }

  const notify = {
    success: (msg) => {
      // Assuming a toast library is available via props or window
      console.log(msg)
    },
    error: (msg) => console.error(msg)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Analytical Archives</h1>
          <p className="text-solar-muted mt-1 font-medium italic">Generating verified intelligence reports and system performance telemetry.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="solar-input min-w-[160px]"
          >
            <option value="week">Range: 7D Yield</option>
            <option value="month">Range: 30D Yield</option>
            <option value="quarter">Range: 90D Yield</option>
            <option value="year">Range: 365D Yield</option>
          </select>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-6 rounded-2xl border transition-all duration-500 text-left solar-glass group relative overflow-hidden ${selectedReport === report.id
              ? 'border-solar-yellow bg-solar-yellow/5'
              : 'border-solar-border/30 hover:border-solar-yellow/40 hover:bg-solar-panel/5'
              }`}
          >
            {selectedReport === report.id && (
              <div className="absolute top-0 right-0 p-2">
                <div className="w-1.5 h-1.5 rounded-full bg-solar-yellow animate-pulse"></div>
              </div>
            )}
            <report.icon className={`w-10 h-10 mb-5 transition-transform duration-500 group-hover:scale-110 ${selectedReport === report.id ? 'text-solar-yellow' : 'text-solar-muted'}`} />
            <h3 className="font-black text-solar-primary uppercase tracking-tight">{report.name}</h3>
            <p className="text-xs font-bold text-solar-muted mt-2 uppercase tracking-widest opacity-60">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="solar-glass rounded-3xl p-8 group border-solar-panel/10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-solar-primary tracking-tighter uppercase">{selectedReport} Intelligence Matrix</h2>
            <p className="text-[10px] font-black text-solar-muted mt-1 uppercase tracking-[0.2em]">Verified Telemetry Snapshot</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleDownload(selectedReport, 'csv')}
              className="px-6 py-2.5 solar-glass rounded-xl text-solar-primary font-black uppercase text-xs tracking-widest border border-solar-border/30 hover:border-solar-yellow/50 transition-all"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-solar-yellow" />
                <span>Export CSV</span>
              </div>
            </button>
            <button
              onClick={() => handleDownload(selectedReport, 'excel')}
              className="sun-button px-8 py-2.5"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats based on report type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="solar-glass bg-solar-night/20 rounded-2xl p-6 border-solar-border/20 group hover:border-solar-yellow/30 transition-all">
              <p className="text-[10px] font-black text-solar-muted uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-2xl font-black text-solar-primary mt-2 tracking-tight group-hover:text-solar-yellow transition-colors">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="solar-glass rounded-3xl p-8 border-solar-panel/10">
        <h2 className="text-2xl font-black text-solar-primary mb-8 tracking-tight uppercase">Historical Archives</h2>
        <div className="space-y-4">
          {[
            { name: 'Monthly Energy Yield - December 2024', date: 'Jan 1, 2025', size: '2.4 MB' },
            { name: 'User Growth Matrix Q4 2024', date: 'Jan 1, 2025', size: '1.8 MB' },
            { name: 'Financial Flux Summary - November 2024', date: 'Dec 1, 2024', size: '1.2 MB' },
            { name: 'System Performance Telemetry', date: 'Nov 15, 2024', size: '3.1 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-5 bg-solar-night/20 rounded-2xl border border-solar-border/10 hover:border-solar-yellow/20 hover:bg-solar-panel/5 transition-all group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-solar-yellow/10 rounded-xl flex items-center justify-center border border-solar-yellow/20 group-hover:scale-105 transition-all">
                  <FileText className="w-6 h-6 text-solar-yellow" />
                </div>
                <div>
                  <p className="font-black text-solar-primary uppercase tracking-tight">{report.name}</p>
                  <p className="text-[10px] font-bold text-solar-muted uppercase mt-1 tracking-widest">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="p-3 text-solar-muted hover:text-solar-yellow transition-all solar-glass rounded-xl border border-solar-border/30 hover:border-solar-yellow/50">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
