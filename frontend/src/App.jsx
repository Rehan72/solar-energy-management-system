import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'
import Dashboard from './pages/Dashboard'
import SolarOnboarding from './pages/user/SolarOnboarding'
import Onboarding from './pages/Onboarding' // New Import
import AuthPage from './auth/AuthPage'
import LandingPage from './pages/LandingPage'
import Master from './router/Master'
import { ThemeProvider } from './contexts/ThemeContext'
import SolarToaster from './components/Toaster'
import SolarInstallationShowcase from './pages/SolarInstallationShowcase'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <SolarToaster />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/solar-onboarding" element={<SolarOnboarding />} />
          <Route path="/onboarding" element={<Onboarding />} /> {/* New Route */}
          <Route path="/solar-installation" element={<SolarInstallationShowcase />} />
          <Route path="/*" element={<Master />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
