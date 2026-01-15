import { useState, useEffect } from 'react'
import { Shield, UserPlus, Search, Filter, RefreshCw, MapPin, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/stat-card'
import DataTable from '../../components/common/DataTable'
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
        <div className="absolute inset-0 bg-solar-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all duration-500">
          <SunLoader message="Synchronizing field personnel data..." size="large" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-solar-primary tracking-tight uppercase">Personnel Registry</h1>
          <p className="text-solar-muted mt-1 font-medium italic">Managing decentralized field intelligence and regional deployments.</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={fetchInstallers}
            className="sun-button px-6 py-2.5"
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Resync</span>
            </div>
          </button>
          <button
            onClick={() => navigate('/installers/create')}
            className="sun-button px-6 py-2.5 border-solar-orange/30 hover:border-solar-orange/50 shadow-solar-orange/10"
          >
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Deploy New Node</span>
            </div>
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
      <div className="solar-glass rounded-2xl p-6 group">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Query personnel by designation or digital signature..."
              value={searchTerm}
              onChange={({ value }) => setSearchTerm(value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-solar-muted group-hover:rotate-180 transition-transform duration-700" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="solar-input min-w-[180px]"
            >
              <option value="ALL">All Sectors</option>
              <option value="Delhi">Sector: Delhi</option>
              <option value="Mumbai">Sector: Mumbai</option>
              <option value="Patna">Sector: Patna</option>
              <option value="Ahmedabad">Sector: Ahmedabad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installers DataTable */}
      <div className="bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-xl p-6">
        <DataTable
          columns={[
            { header: 'Name', accessorKey: 'name' },
            { header: 'Email', accessorKey: 'email' },
            { header: 'Phone', accessorKey: 'phone' },
            { header: 'Region', accessorKey: 'region' },
            {
              header: 'Status',
              accessorKey: 'status',
              cell: (inst) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${inst.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {inst.status}
                </span>
              )
            },
            { header: 'Joined', accessorKey: 'joinDate' },
            {
              header: 'Actions',
              cell: (inst) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewInstaller(inst)}
                    className="p-1 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditInstaller(inst)}
                    className="p-1 hover:text-solar-accent transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInstaller(inst)}
                    className="p-1 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
          data={filteredInstallers}
          showPagination={true}
        />
      </div>
    </div>
  )
}
