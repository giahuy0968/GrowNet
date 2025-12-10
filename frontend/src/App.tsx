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
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import AdvancedSettings from './pages/AdvancedSettings';
import TermsPrivacy from './pages/TermsPrivacy';
import ProfileMenteeChange from './pages/MenteeProfileChange';
import Schedule from './pages/Schedule';
import MentorProfile from './pages/MentorProfile';
import MentorProfileChange from './pages/MentorProfileChange';
import MenteeProfile from './pages/MenteeProfile';
import CallPage from './pages/CallPage';
import AppointmentDetail from './pages/AppointmentDetail';
const MyProfileWrapper = () => {
    // Logic giả định: kiểm tra xem người dùng hiện tại là mentor hay mentee
    const isCurrentUserMentor = true; // Thay bằng logic thực tế
    if (isCurrentUserMentor) {
        // Render MentorProfile với prop isOwner=true
        return <MentorProfile isOwner={true} />;
    } else {
        // Render MenteeProfile với prop isOwner=true
        return <MenteeProfile isOwner={true} />;
    }
}
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
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/advanced-settings" element={<AdvancedSettings />} />
        <Route path="/terms-privacy" element={<TermsPrivacy />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/mentee-profile/:id" element={<MenteeProfile isOwner={false} />} />
        <Route path="/mentor-profile/:id" element={<MentorProfile isOwner={false} />} />
        <Route path="/my-profile" element={<MyProfileWrapper />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/:id" element={<AppointmentDetail />} />
        <Route path="/call/:chatName" element={<CallPage />} />
        <Route path="/profile-change" element={<ProfileMenteeChange />} />
        <Route path="/mentorchange" element={<MentorProfileChange />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
