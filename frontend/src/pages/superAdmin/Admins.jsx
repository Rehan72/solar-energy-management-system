import { useState, useEffect } from 'react'
import { Shield, UserPlus, Search, Filter, RefreshCw, MapPin, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/stat-card'
import CardTable from '../../components/common/CardTable'
import SearchBar from '../../components/common/Search'
import SunLoader from '../../components/SunLoader'
import { getRequest, deleteRequest } from '../../lib/apiService'

export default function Admins() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRegion, setFilterRegion] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await getRequest('/superadmin/admins')
      // Combine first_name and last_name into name field
      const adminsData = (response.data.admins || []).map(admin => ({
        ...admin,
        name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim(),
        phone: admin.phone || 'N/A',
        address: admin.region || 'N/A',
        joinDate: admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A',
        role: 'Admin',
        status: admin.status || 'ACTIVE',
        gender: admin.gender || 'N/A',
        age: admin.age || 'N/A',
        nationality: admin.nationality || 'N/A',
        department: admin.region || 'N/A',
      }))
      setAdmins(adminsData)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (admin) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return
    
    try {
      await deleteRequest(`/superadmin/admins/${admin.id}`)
      fetchAdmins()
    } catch (error) {
      console.error('Failed to delete admin:', error)
    }
  }

  const handleEditAdmin = (admin) => {
    navigate(`/admins/${admin.id}`)
  }

  const handleViewAdmin = (admin) => {
    navigate(`/admins/${admin.id}?view=true`)
  }

  useEffect(() => {
    fetchAdmins()
  }, [])



  return (
    <div className="space-y-6 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-solar-bg/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <SunLoader message="Loading admins..." size="large" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Admin Management</h1>
          <p className="text-solar-muted mt-1">Manage regional administrators and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchAdmins}
            className="flex items-center space-x-2 px-4 py-2 border border-solar-border rounded-xl hover:bg-solar-yellow/10 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 text-solar-muted" />
            <span className="text-solar-muted font-medium">Refresh</span>
          </button>
          <button 
            onClick={() => navigate('/admins/create')}
            className="sun-button"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Admins"
          value={admins.length}
          icon={Shield}
          color="text-solar-orange"
          gradient="from-solar-orange/20 to-solar-orange/5"
        />
        <StatCard
          title="Active Admins"
          value={admins.filter(a => a.status === 'ACTIVE').length}
          icon={Shield}
          color="text-solar-success"
          gradient="from-solar-success/20 to-solar-success/5"
        />
        <StatCard
          title="Regions Covered"
          value={new Set(admins.map(a => a.region).filter(Boolean)).size}
          icon={MapPin}
          color="text-solar-panel"
          gradient="from-solar-panel/20 to-solar-panel/5"
        />
        <StatCard
          title="Pending Approvals"
          value={admins.filter(a => a.status === 'PENDING').length}
          icon={Shield}
          color="text-solar-warning"
          gradient="from-solar-warning/20 to-solar-warning/5"
        />
      </div>

      {/* Filters and Search */}
      <div className="solar-glass rounded-2xl p-6 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={({ value }) => setSearchTerm(value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-solar-muted" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="solar-input"
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

      {/* Admins Card Table */}
      <CardTable
        users={admins}
        title="Admins"
        subtitle="No admins found. Try adjusting your search or filters."
        onEdit={handleEditAdmin}
        onView={handleViewAdmin}
        onDelete={handleDeleteAdmin}
        showPagination={true}
        paginationInfo={{
          currentPageItems: admins.length,
          totalItems: admins.length,
          previousPage: false,
          nextPage: false,
        }}
      />
    </div>
  )
}
