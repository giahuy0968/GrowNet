import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ProfileSetup.css'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    role: '',
    profession: '',
    education: '',
    introduction: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save profile data
    navigate('/dashboard')
  }

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h1 className="profile-title">HOÀN THIỆN HỒ SƠ CỦA BAN</h1>
        <p className="profile-subtitle">Vui lòng điền thông tin cơ bản để GrowNet có thể kết nối bạn tốt hơn.</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              name="fullName"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày tháng năm sinh</label>
              <input
                type="date"
                name="birthDate"
                placeholder="dd/mm/yyyy"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vai trò đã chọn</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Mentee (Học hỏi)</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nghề nghiệp/Chức danh</label>
              <input
                type="text"
                name="profession"
                placeholder="Ví dụ: Lập trình viên, Sinh viên Marketing, Quản lý dự án"
                value={formData.profession}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Học vấn</label>
            <input
              type="text"
              name="education"
              placeholder="Ví dụ: Đại học Bách Khoa, Thạc sĩ Kinh doanh"
              value={formData.education}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Giới thiệu bản thân (Không bắt buộc)</label>
            <textarea
              name="introduction"
              placeholder="Mục tiêu của bạn là gì? Bạn muốn học hay chia sẻ những kinh nghiệm nào?"
              value={formData.introduction}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <button type="submit" className="btn-submit">
            ✓ BẮT ĐẦU KHÁM PHÁ
          </button>
        </form>
      </div>
    </div>
  )
}
