import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const displayName = user?.fullName || user?.username || 'Người dùng'
  const avatar = user?.avatar || '/user_avt.png'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <div className="settings-page">
      <div className="settings-card">
        {/* Header with gradient */}
        <div className="settings-header">
          <button className="settings-back-btn" aria-label="Quay lại" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2>Cài Đặt</h2>
          <div className="settings-header-decoration"></div>
        </div>

        {/* Avatar + Name with enhanced styling */}
        <div className="settings-user">
          <div className="settings-avatar-wrapper">
            <img src={avatar} alt="User" className="settings-avatar" />
            <div className="settings-avatar-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
          <div className="settings-user-info">
            <h3>{displayName}</h3>
            {user?.email && <p className="settings-email">{user.email}</p>}
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            TÀI KHOẢN
          </h4>
          <div className="settings-item" onClick={() => navigate("/profile-change")}>
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span>Chỉnh sửa hồ sơ</span>
            <span className="arrow">›</span>
          </div>
          <div className="settings-item" onClick={() => navigate("/change-password")}>
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span>Đổi mật khẩu</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Community Section */}
        <div className="settings-section">
          <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            CHUNG & CỘNG ĐỒNG
          </h4>
          <div className="settings-item" onClick={() => navigate("/advanced-settings")}>
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
              </svg>
            </div>
            <span>Cài đặt Nâng cao</span>
            <span className="arrow">›</span>
          </div>
          <div className="settings-item" onClick={() => navigate("/terms-privacy")}>
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Điều khoản & Quyền riêng tư</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          ĐĂNG XUẤT
        </button>
      </div>
    </div>
  )
}
