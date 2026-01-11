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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Reports</h1>
          <p className="text-solar-muted mt-1">Generate and download system reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 bg-solar-card text-solar-primary border border-solar-border rounded-lg px-3"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-xl border transition-all duration-300 text-left ${selectedReport === report.id
              ? 'bg-solar-card border-solar-yellow shadow-lg shadow-solar-yellow/10'
              : 'bg-solar-card border-solar-border hover:border-solar-yellow/50'
              }`}
          >
            <report.icon className={`w-8 h-8 mb-3 ${selectedReport === report.id ? 'text-solar-yellow' : 'text-solar-muted'}`} />
            <h3 className="font-semibold text-solar-primary">{report.name}</h3>
            <p className="text-sm text-solar-muted mt-1">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-solar-card rounded-xl p-6 energy-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-solar-primary capitalize">{selectedReport} Report</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload(selectedReport, 'csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-solar-card text-solar-primary font-semibold rounded-lg border border-solar-yellow hover:bg-solar-yellow/10 transition"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleDownload(selectedReport, 'excel')}
              className="flex items-center space-x-2 px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Stats based on report type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-solar-night/30 rounded-lg p-4">
              <p className="text-sm text-solar-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-2xl font-bold text-solar-primary mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-solar-card rounded-xl p-6 energy-card">
        <h2 className="text-xl font-bold text-solar-primary mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {[
            { name: 'Monthly Energy Report - December 2024', date: 'Jan 1, 2025', size: '2.4 MB' },
            { name: 'User Growth Analysis Q4 2024', date: 'Jan 1, 2025', size: '1.8 MB' },
            { name: 'Revenue Summary - November 2024', date: 'Dec 1, 2024', size: '1.2 MB' },
            { name: 'System Performance Report', date: 'Nov 15, 2024', size: '3.1 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-solar-night/20 rounded-lg hover:bg-solar-night/40 transition">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-solar-yellow" />
                <div>
                  <p className="font-medium text-solar-primary">{report.name}</p>
                  <p className="text-sm text-solar-muted">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="p-2 text-solar-muted hover:text-solar-yellow transition">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
