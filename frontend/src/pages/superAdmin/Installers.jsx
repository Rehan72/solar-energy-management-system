import { useState, useEffect } from 'react'
import { Shield, UserPlus, Search, Filter, RefreshCw, MapPin, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/stat-card'
import CardTable from '../../components/common/CardTable'
import SearchBar from '../../components/common/Search'
import SunLoader from '../../components/SunLoader'
import { getRequest, deleteRequest } from '../../lib/apiService'

export default function Installers() {
  const navigate = useNavigate()
  const [installers, setInstallers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRegion, setFilterRegion] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchInstallers = async () => {
    setLoading(true)
    try {
      // Fetch specifically for Super Admin to see all
      const response = await getRequest('/superadmin/installers')
      
      const installersData = (response.data.installers || []).map(inst => ({
        ...inst,
        name: `${inst.first_name || ''} ${inst.last_name || ''}`.trim(),
        phone: inst.phone || 'N/A',
        address: inst.region || 'N/A',
        joinDate: inst.created_at ? new Date(inst.created_at).toLocaleDateString() : 'N/A',
        role: 'Installer',
        status: inst.status || 'ACTIVE',
        gender: inst.gender || 'N/A',
        age: inst.age || 'N/A',
        nationality: inst.nationality || 'N/A',
        department: inst.region || 'N/A',
      }))
      setInstallers(installersData)
    } catch (error) {
      console.error('Failed to fetch installers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInstaller = async (installer) => {
    if (!confirm('Are you sure you want to delete this installer? This action cannot be undone.')) return
    
    try {
      // Using generic delete user endpoint
      await deleteRequest(`/superadmin/admins/${installer.id}`) 
      fetchInstallers()
    } catch (error) {
      console.error('Failed to delete installer:', error)
    }
  }

  const handleEditInstaller = (installer) => {
    navigate(`/users/${installer.id}/edit`) // or /installers/:id/edit if separate
  }

  const handleViewInstaller = (installer) => {
    navigate(`/users/${installer.id}?view=true`)
  }

  useEffect(() => {
    fetchInstallers()
  }, [])

  // Filter Logic
  const filteredInstallers = installers.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inst.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = filterRegion === 'ALL' || inst.region === filterRegion
    return matchesSearch && matchesRegion
  })

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-solar-bg/80 z-50 flex flex-col items-center justify-center">
          <SunLoader message="Loading installers..." size="large" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Installer Management</h1>
          <p className="text-solar-muted mt-1">Manage field installers and their assignments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchInstallers}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => navigate('/installers/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-orange text-white font-semibold rounded-lg hover:bg-solar-orange/80 transition sun-button"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Installer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Installers"
          value={installers.length}
          icon={Shield}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Active Installers"
          value={installers.filter(i => i.status === 'ACTIVE').length}
          icon={Shield}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Regions Covered"
          value={new Set(installers.map(i => i.region).filter(Boolean)).size}
          icon={MapPin}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
        <StatCard
          title="Pending"
          value={installers.filter(i => i.status === 'PENDING').length}
          icon={Shield}
          color="text-solar-warning"
          gradient="from-solar-warning/20 to-solar-warning/5"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-solar-card rounded-lg p-4 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search installers by name or email..."
              value={searchTerm}
              onChange={({ value }) => setSearchTerm(value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-solar-muted" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-3 py-2 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary focus:outline-none focus:border-solar-yellow"
            >
              <option value="ALL">All Regions</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Patna">Patna</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installers Card Table */}
      <CardTable
        users={filteredInstallers}
        title="Installers"
        subtitle="No installers found."
        onEdit={handleEditInstaller}
        onView={handleViewInstaller}
        onDelete={handleDeleteInstaller}
        showPagination={true}
        paginationInfo={{
          currentPageItems: filteredInstallers.length,
          totalItems: filteredInstallers.length,
          previousPage: false,
          nextPage: false,
        }}
      />
    </div>
  )
}
