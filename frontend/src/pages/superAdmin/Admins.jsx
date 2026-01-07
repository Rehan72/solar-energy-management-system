import { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, UserPlus, Search, Filter, RefreshCw, MapPin, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/stat-card'
import DataTable from '../../components/common/DataTable'
import { Button } from '@/components/ui/button'

const API_BASE_URL = 'http://localhost:8080'

export default function Admins() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRegion, setFilterRegion] = useState('ALL')
  const token = localStorage.getItem('token')

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Combine first_name and last_name into name field
      const adminsData = (response.data.admins || []).map(admin => ({
        ...admin,
        name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim()
      }))
      setAdmins(adminsData)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    }
  }

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return
    
    try {
      await axios.delete(`${API_BASE_URL}/superadmin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAdmins()
    } catch (error) {
      console.error('Failed to delete admin:', error)
      alert(error.response?.data?.error || 'Failed to delete admin')
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const filteredAdmins = admins.filter(admin => {
    const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim().toLowerCase()
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = admin.email?.toLowerCase().includes(searchTermLower) ||
                         fullName.includes(searchTermLower) ||
                         admin.first_name?.toLowerCase().includes(searchTermLower) ||
                         admin.last_name?.toLowerCase().includes(searchTermLower)
    const matchesRegion = filterRegion === 'ALL' || admin.region === filterRegion
    return matchesSearch && matchesRegion
  })

  // Define columns for DataTable
  const columns = [
    {
      accessorKey: 'name',
      header: 'Full Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => {
        const statusColors = {
          ACTIVE: 'bg-solar-success text-white',
          INACTIVE: 'bg-solar-danger text-white',
          PENDING: 'bg-solar-warning text-solar-dark',
        }
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[row.status] || 'bg-solar-muted text-solar-primary'}`}>
            {row.status || 'ACTIVE'}
          </span>
        )
      },
    },
    {
      accessorKey: 'region',
      header: 'Region',
    },
    {
      accessorKey: 'users_count',
      header: 'Users',
    },
    {
      accessorKey: 'plants_count',
      header: 'Plants',
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/admins/${row.id}`)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/admins/${row.id}/edit`)
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteAdmin(row.id)
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'w-36',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold sun-glow-text">Admin Management</h1>
          <p className="text-solar-muted mt-1">Manage regional administrators and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchAdmins}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg transition sun-button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => navigate('/admins/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-solar-orange text-white font-semibold rounded-lg hover:bg-solar-orange/80 transition sun-button"
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
      <div className="bg-solar-card rounded-lg p-4 energy-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-solar-muted" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-solar-night/80 border border-solar-border rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:border-solar-yellow"
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

      {/* Admins Table */}
      <DataTable
        columns={columns}
        data={filteredAdmins}
        title="Admins"
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage="No admins found"
        onRowClick={(row) => navigate(`/admins/${row.id}`)}
      />
    </div>
  )
}
