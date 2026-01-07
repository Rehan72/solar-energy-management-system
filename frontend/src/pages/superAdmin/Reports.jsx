import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Download, Calendar, TrendingUp, Users, Zap, DollarSign, RefreshCw, FileText } from 'lucide-react'
import StatCard from '../../components/ui/stat-card'

const API_BASE_URL = 'http://localhost:8080'

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const token = localStorage.getItem('token')

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/superadmin/reports?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReports(response.data.reports || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [selectedPeriod])

  const reportTypes = [
    {
      title: 'User Activity Report',
      description: 'Detailed user engagement and activity metrics',
      icon: Users,
      color: 'text-solar-yellow',
      bgColor: 'bg-solar-yellow/10'
    },
    {
      title: 'Energy Generation Report',
      description: 'Solar energy production and efficiency analysis',
      icon: Zap,
      color: 'text-solar-success',
      bgColor: 'bg-solar-success/10'
    },
    {
      title: 'Financial Report',
      description: 'Revenue, savings, and ROI calculations',
      icon: DollarSign,
      color: 'text-solar-orange',
      bgColor: 'bg-solar-orange/10'
    },
    {
      title: 'System Performance Report',
      description: 'Platform uptime and system health metrics',
      icon: TrendingUp,
      color: 'text-solar-panel',
      bgColor: 'bg-solar-panel/10'
    }
  ]

  const quickStats = [
    { label: 'Total Reports Generated', value: '247', icon: FileText, color: 'text-solar-primary', gradient: 'from-solar-primary/20 to-solar-primary/5' },
    { label: 'This Month', value: '34', icon: Calendar, color: 'text-solar-yellow', gradient: 'from-solar-yellow/20 to-solar-orange/10' },
    { label: 'Active Downloads', value: '12', icon: Download, color: 'text-solar-success', gradient: 'from-solar-success/20 to-solar-success/5' },
    { label: 'Scheduled Reports', value: '8', icon: BarChart3, color: 'text-solar-orange', gradient: 'from-solar-orange/20 to-solar-orange/5' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Reports & Analytics</h1>
          <p className="text-solar-muted mt-1">Generate and download comprehensive system reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchReports}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-solar-warning text-solar-dark font-semibold rounded-lg hover:bg-solar-warning/80 transition sun-button">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Period Selector */}
      <div className="bg-solar-card rounded-lg p-4 energy-card">
        <div className="flex items-center space-x-4">
          <span className="text-solar-primary font-medium">Report Period:</span>
          <div className="flex space-x-2">
            {['weekly', 'monthly', 'quarterly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition sun-button ${
                  selectedPeriod === period
                    ? 'bg-solar-yellow text-solar-dark'
                    : 'bg-solar-night/80 text-solar-muted hover:bg-solar-panel/20'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-gradient-to-br from-solar-card to-solar-night/30 rounded-xl p-8 energy-card border border-solar-border/50 shadow-xl">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-solar-primary mb-2">{report.title}</h3>
                <p className="text-solar-muted mb-4">{report.description}</p>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button">
                    Generate Report
                  </button>
                  <button className="px-4 py-2 bg-solar-panel/20 text-solar-panel font-semibold rounded-lg hover:bg-solar-panel/30 transition sun-button">
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-solar-card rounded-lg overflow-hidden energy-card">
        <div className="p-6 border-b border-solar-border">
          <h2 className="text-xl font-semibold text-solar-primary">Recent Reports</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-solar-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-solar-muted">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-solar-muted mx-auto mb-4" />
            <p className="text-solar-muted">No reports generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-solar-night/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-solar-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solar-border">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-solar-night/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-solar-yellow mr-3" />
                        <span className="text-sm font-medium text-solar-primary">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-solar-panel/20 text-solar-panel">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-solar-muted">
                      {report.generated_at || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-solar-muted">
                      {report.size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-solar-yellow hover:text-solar-orange transition sun-button mr-3">
                        Download
                      </button>
                      <button className="text-solar-muted hover:text-solar-primary transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
