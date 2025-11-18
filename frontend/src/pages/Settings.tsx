import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Settings.css";

interface SettingsProps {
  onClose?: () => void;
  userName?: string;
  userAvatar?: string;
}

export default function Settings({
  onClose,
  userName = "Hà Anh Tứn",
  userAvatar = "/user_avt.png",
}: SettingsProps) {
  const navigate = useNavigate();
  return (
    <div className="settings-page">
      <div className="settings-card">
        {/* Header */}
        <div className="settings-header">
          <h2>Cài Đặt</h2>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Avatar + Name */}
        <div className="settings-user">
          <img src={userAvatar} alt="User" className="settings-avatar" />
          <h3>{userName}</h3>
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

        {/* Community Section */}
        <div className="settings-section">
          <h4>CHUNG & CỘNG ĐỒNG</h4>
          <div className="settings-item" onClick={() => navigate("/advanced-settings")} style={{ cursor: "pointer" }}>
            <span>Cài đặt Nâng cao</span>
            <span className="arrow">›</span>
          </div>
          <div className="settings-item">
            <span>Điều khoản & Quyền riêng tư</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="logout-btn">ĐĂNG XUẤT</button>
      </div>
    </div>
  );
}
