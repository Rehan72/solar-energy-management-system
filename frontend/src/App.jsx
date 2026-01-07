import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'
import Dashboard from './pages/Dashboard'
import AuthPage from './auth/AuthPage'
import LandingPage from './pages/LandingPage'
import Master from './router/Master'
import { ThemeProvider } from './contexts/ThemeContext'
import SolarToaster from './components/Toaster'
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
          <Route path="/*" element={<Master />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
