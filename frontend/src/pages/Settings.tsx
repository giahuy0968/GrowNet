import React from "react";
import "../styles/Settings.css";

interface SettingsProps {
  onClose?: () => void;
  userName?: string;
  userAvatar?: string;
}

export default function Settings({
  onClose,
  userName = "Nguyễn Thị Minh Anh",
  userAvatar = "/user_avt.png",
}: SettingsProps) {
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
          <div className="settings-item">
            <span>Chỉnh sửa hồ sơ</span>
            <span className="arrow">›</span>
          </div>
          <div className="settings-item">
            <span>Đổi mật khẩu</span>
            <span className="arrow">›</span>
          </div>
        </div>

        {/* Community Section */}
        <div className="settings-section">
          <h4>CHUNG & CỘNG ĐỒNG</h4>
          <div className="settings-item">
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
