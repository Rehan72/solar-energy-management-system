import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import DataTable from './DataTable'
import { Edit, Trash2, Plus, Eye } from 'lucide-react'
import UserForm from './UserForm'

const API_BASE_URL = 'http://localhost:8080'

function UserTable({ users, onUserChange, currentUserRole, endpoint }) {
  const [editingUser, setEditingUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const token = localStorage.getItem('token')

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await axios.delete(`${API_BASE_URL}${endpoint}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onUserChange()
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  const handleFormClose = () => {
    setEditingUser(null)
    setShowForm(false)
    onUserChange()
  }

  const handleAdd = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  return (
    <div className="bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark">Users</h3>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      <DataTable
        columns={[
          {
            header: 'Name',
            cell: (user) => `${user.first_name} ${user.last_name}`
          },
          {
            header: 'Email',
            accessorKey: 'email'
          },
          {
            header: 'Role',
            accessorKey: 'role'
          },
          {
            header: 'Created At',
            accessorKey: 'created_at',
            cell: (user) => new Date(user.created_at).toLocaleDateString()
          },
          {
            header: 'Actions',
            cell: (user) => (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/users/${user.id}?view=true`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )
          }
        ]}
        data={users}
        showPagination={true}
      />

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleFormClose}
          endpoint={endpoint}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  )
}

export default UserTable