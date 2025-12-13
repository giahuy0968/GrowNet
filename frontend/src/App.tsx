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
import { ProtectedRoute } from './components/ProtectedRoute'
import Settings from './pages/Settings'
import ChangePassword from './pages/ChangePassword'
import AdvancedSettings from './pages/AdvancedSettings'
import TermsPrivacy from './pages/TermsPrivacy'
import ProfileMenteeChange from './pages/MenteeProfileChange'
import Schedule from './pages/Schedule'
import MentorProfile from './pages/MentorProfile'
import MentorProfileChange from './pages/MentorProfileChange'
import MenteeProfile from './pages/MenteeProfile'
import CallPage from './pages/CallPage'
import AppointmentDetail from './pages/AppointmentDetail'
import MessageSearch from './pages/MessageSearch'
import NotFound from './pages/NotFound'
import ScheduleDetail from './pages/ScheduleDetail'
import Profile from './pages/Profile'
import MentorSchedule from './pages/mentorSchedule'
import MyProfile from './pages/MyProfile'
import UserProfile from './pages/UserProfile'
import MentorAcademy from './pages/MentorAcademy'
import CourseCatalog from './pages/CourseCatalog'
import AdminUserManagement from './pages/AdminUserManagement'
import Social from './pages/Social'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<Welcome />} />
      {/* Các trang dùng chung Header qua MainLayout */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profiles/:id" element={<UserProfile />} />
        <Route path="/messages/search" element={<MessageSearch />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/advanced-settings" element={<AdvancedSettings />} />
        <Route path="/terms-privacy" element={<TermsPrivacy />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/mentee-profile/:id" element={<MenteeProfile isOwner={false} />} />
        <Route path="/mentor-profile/:id" element={<MentorProfile isOwner={false} />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/:id" element={<AppointmentDetail />} />
        <Route path="/schedule/detail" element={<ScheduleDetail />} />
        <Route path="/mentorSchedule" element={<MentorSchedule />} />
        <Route path="/mentor-academy" element={<MentorAcademy />} />
        <Route path="/social" element={<Social />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/call/:chatName" element={<CallPage />} />
        <Route path="/profile-change" element={<ProfileMenteeChange />} />
        <Route path="/mentorchange" element={<MentorProfileChange />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}//hello sửa lại gòi nè
