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
        {/* Header */}
        <div className="settings-header">
          <button className="settings-back-btn" aria-label="Quay lại" onClick={() => navigate(-1)}>
            &#8592;
          </button>
          <h2>Cài Đặt</h2>
        </div>

        {/* Avatar + Name */}
        <div className="settings-user">
          <img src={avatar} alt="User" className="settings-avatar" />
          <div>
            <h3>{displayName}</h3>
            {user?.email && <p className="settings-email">{user.email}</p>}
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <h4>TÀI KHOẢN</h4>
          <div className="settings-item" onClick={() => navigate("/profile-change")} style={{ cursor: "pointer" }}>
            <span>Chỉnh sửa hồ sơ</span>
            <span className="arrow">›</span>
          </div>
          <div className="settings-item" onClick={() => navigate("/change-password")} style={{ cursor: "pointer" }}>
            <span>Đổi mật khẩu</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Community Sectionsdfndfbewifubei */}
        <div className="settings-section">
          <h4>CHUNG & CỘNG ĐỒNG</h4>
          <div className="settings-item" onClick={() => navigate("/advanced-settings")} style={{ cursor: "pointer" }}>
            <span>Cài đặt Nâng cao</span>
            <span className="arrow">›</span>
          </div>
          <div className="settings-item" onClick={() => navigate("/terms-privacy")} style={{ cursor: "pointer" }}>
            <span>Điều khoản & Quyền riêng tư</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>ĐĂNG XUẤT</button>
      </div>
    </div>
  )
}
