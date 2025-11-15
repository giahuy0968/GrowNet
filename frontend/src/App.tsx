import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import ProfileSetup from './pages/ProfileSetup'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import MainLayout from './MainLayout'
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import AdvancedSettings from './pages/AdvancedSettings';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      {/*Layout có Header cố định */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/advanced-settings" element={<AdvancedSettings />} />
      </Route>
    </Routes>
  )
}
