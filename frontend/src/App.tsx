import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminRoutes from './Admin'
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
import TermsPrivacy from './pages/TermsPrivacy';
import ProfileMenteeChange from './pages/MenteeProfileChange';
import Schedule from './pages/Schedule';
import MentorProfile from './pages/MentorProfile';
import MentorProfileChange from './pages/MentorProfileChange';
import MenteeProfile from './pages/MenteeProfile';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<Welcome />} />
      {/* Các trang dùng chung Header qua MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/advanced-settings" element={<AdvancedSettings />} />
        <Route path="/terms-privacy" element={<TermsPrivacy />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/mentee-profile" element={<MenteeProfile />} />
        <Route path="/mentor-profile" element={<MentorProfile />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile-change" element={<ProfileMenteeChange />} />
        <Route path="/mentorchange" element={<MentorProfileChange />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  )
}
