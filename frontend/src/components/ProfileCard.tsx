
import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ProfileCard.css'

export default function ProfileCard() {
  const navigate = useNavigate()
  return (
    <div className="profile-card">
      <div className="profile-header">
        <img src="/profile-bg.jpg" alt="Background" className="profile-bg" />
      </div>

      <div className="profile-body">
        <div className="profile-info">
          <h2>Nguyễn A</h2>
          <p className="profile-role">Frontend Developer • TP.HCM</p>

          <div className="profile-tags">
            <span className="tag">ReactJS</span>
            <span className="tag">TypeScript</span>
            <span className="tag">UI/UX</span>
          </div>

          <div className="profile-description">
            <h3>Mô tả tóm tắt</h3>
            <p>
              Chuyên gia Frontend 5 năm kinh nghiệm. Đã hoàn thành hơn 10 dự án lớn nhờ sử dụng React và NextJS, tập trung vào hiệu suất và trải nghiệm người dùng...
            </p>
            <button className="btn-read-more">Xem thêm chi tiết</button>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn-action btn-cancel">✕</button>
        <button className="btn-action btn-accept" onClick={() => navigate('/chat')}>✓</button>
      </div>
    </div>
  )
}
