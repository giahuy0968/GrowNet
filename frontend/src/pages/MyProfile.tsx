import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/MyProfile.css'

export default function MyProfile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="my-profile-page">
        <div className="profile-card loading">
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    )
  }

  const location = [user.location?.city, user.location?.country]
    .filter(Boolean)
    .join(', ') || 'Chưa cập nhật'
  const interests = user.interests && user.interests.length > 0 ? user.interests : []
  const fields = user.fields && user.fields.length > 0 ? user.fields : []
  const skills = user.skills && user.skills.length > 0 ? user.skills : []
  const experienceYears = user.experienceYears ?? 0
  const joinedAt = new Date(user.createdAt).toLocaleDateString('vi-VN')

  return (
    <div className="my-profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img src={user.avatar || '/user_avt.png'} alt={user.fullName} className="profile-avatar" />
          <div>
            <h1>{user.fullName || user.username}</h1>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-location">{location}</p>
          </div>
          <div className="profile-actions">
            <Link to="/settings" className="btn-primary">Cập nhật hồ sơ</Link>
            <Link to="/dashboard" className="btn-ghost">Về Dashboard</Link>
          </div>
        </div>

        <div className="profile-grid">
          <section>
            <h2>Thông tin chính</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Số năm kinh nghiệm</dt>
                <dd>{experienceYears > 0 ? `${experienceYears}+ năm` : 'Chưa cập nhật'}</dd>
              </div>
              <div>
                <dt>Tham gia từ</dt>
                <dd>{joinedAt}</dd>
              </div>
              <div>
                <dt>Hoạt động gần nhất</dt>
                <dd>{new Date(user.lastActive).toLocaleString('vi-VN')}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Giới thiệu</h2>
            <p className="profile-bio">{user.bio || 'Bạn chưa cập nhật phần giới thiệu.'}</p>
          </section>
        </div>

        <div className="profile-tags-section">
          <section>
            <h3>Lĩnh vực quan tâm</h3>
            <div className="tag-list">
              {(fields.length ? fields : interests).map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
              {fields.length === 0 && interests.length === 0 && <span className="tag muted">Chưa cập nhật</span>}
            </div>
          </section>

          <section>
            <h3>Kỹ năng nổi bật</h3>
            <div className="tag-list">
              {skills.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
              {skills.length === 0 && <span className="tag muted">Chưa cập nhật</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
