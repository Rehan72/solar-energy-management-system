import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserDashboard from '../components/dashboards/UserDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard'

function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(localStorage.getItem('user')))
  }, [token, navigate])

  if (!user) {
    return <div>Loading...</div>
  }

  const role = user.role

  if (role === 'USER') {
    return <UserDashboard />
  } else if (role === 'ADMIN') {
    return <AdminDashboard />
  } else if (role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />
  } else {
    return <div>Unknown role</div>
  }
}

export default Dashboard