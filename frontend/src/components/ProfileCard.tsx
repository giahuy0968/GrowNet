
import React from 'react'
import '../styles/ProfileCard.css'
import { useNavigate } from 'react-router-dom';

export default function ProfileCard({ userId = 'mentor-123' }) { // Thêm prop để xác định ID
  const navigate = useNavigate();
  // Logic giả định để xác định loại profile và điều hướng
  const profileType = 'mentor'; // Thay bằng logic thực tế (mentor/mentee)
  const handleClick = () => {
      // Điều hướng đến trang hồ sơ chi tiết của người khác
      navigate(`/${profileType}-profile/${userId}`); 
  }
  return (
    <div className="profile-card" onClick={handleClick}>
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
          </div>
        </div>
      </div>

      <div className="profile-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn-action btn-cancel">✕</button>
        <button className="btn-action btn-accept">✓</button>
      </div>
    </div>
  )
}
