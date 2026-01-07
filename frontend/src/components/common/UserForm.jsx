import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_BASE_URL = 'http://localhost:8080'

function UserForm({ user, onClose, endpoint, currentUserRole }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'USER',
    admin_id: null
  })
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'USER',
        admin_id: user.admin_id || null
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'USER',
        admin_id: null
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (user) {
        // Update
        await axios.put(`${API_BASE_URL}${endpoint}/${user.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create
        await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save user')
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getRoleOptions = () => {
    if (currentUserRole === 'SUPER_ADMIN') {
      return [
        { value: 'USER', label: 'User' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'SUPER_ADMIN', label: 'Super Admin' }
      ]
    } else if (currentUserRole === 'ADMIN') {
      return [
        { value: 'USER', label: 'User' }
      ]
    }
    return []
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive p-6 rounded-xl w-full max-w-md">
        <h3 className="text-lg font-semibold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark mb-4">
          {user ? 'Edit User' : 'Add User'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          {!user && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full p-2 bg-solar-bgLight dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-md text-solar-textPrimaryLight dark:text-solar-textPrimaryDark"
            >
              {getRoleOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm