import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import ProfileSetup from './pages/ProfileSetup'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import BarChartDemo from './components/admin/BarChartDemo'
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes - User & Admin */}
        <Route path="/welcome" element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        } />
        <Route path="/profile-setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />

        {/* Admin Only Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute requireAdmin>
            {/* Add your admin components here */}
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              {/* Add more admin routes as needed */}
            </Routes>
            <Route path="/admin/BarChartDemo" element={<BarChartDemo />} />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}
