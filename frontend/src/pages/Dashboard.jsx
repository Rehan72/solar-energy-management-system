import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserDashboard from '../components/dashboards/UserDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard'
import SunLoader from '../components/SunLoader'

function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(localStorage.getItem('user'))
    setUser(userData)

    if (userData && userData.role === 'USER' && !userData.property_type) {
      navigate('/solar-onboarding')
    }
  }, [token, navigate])

  if (!user) {
    return <SunLoader message="Loading your dashboard..." />
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