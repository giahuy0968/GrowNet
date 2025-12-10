import React, { useState } from 'react'
import '../styles/ChatInfo.css'

interface ChatInfoProps {
  chatName: string | null;
  role?: 'mentor' | 'mentee';
  onOpenSearch?: () => void;
}

export default function ChatInfo({ chatName, role = 'mentee', onOpenSearch }: ChatInfoProps) {
  if (!chatName) return null

  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleDeleteHistory = () => {
    // TODO: integrate real delete logic
    // eslint-disable-next-line no-console
    console.log('Delete chat history triggered for', chatName)
    setSettingsOpen(false)
  }

  const handleReport = () => {
    // TODO: integrate real report logic
    // eslint-disable-next-line no-console
    console.log('Report chat triggered for', chatName)
    setSettingsOpen(false)
  }

  return (
    <div className="chat-info">
      <div className="info-header">
        <h3>THÔNG TIN HỘI THOẠI</h3>
      </div>

      <div className="user-profile">
        <button
          type="button"
          className="settings-btn"
          aria-label="Cài đặt hội thoại"
          onClick={() => setSettingsOpen(o => !o)}
        >⚙️</button>
        <img src="/user_avt.png" alt={chatName} className="profile-avatar" />
        <h4>{chatName}</h4>
        <p className="status">🟢 Đang hoạt động</p>
        {settingsOpen && (
          <div className="settings-menu" role="menu" aria-label="Tùy chọn cài đặt">
            <button
              type="button"
              className="settings-item danger"
              role="menuitem"
              onClick={handleDeleteHistory}
            >Xóa lịch sử trò chuyện</button>
            <button
              type="button"
              className="settings-item warn"
              role="menuitem"
              onClick={handleReport}
            >Báo cáo</button>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <button className="action-btn" onClick={() => window.location.assign(role === 'mentor' ? '/mentor-profile' : '/mentee-profile')}>
          <div>
            <span>👤</span>
          </div>
          <span>Xem trang cá nhân</span>
        </button>
        <button className="action-btn" onClick={() => onOpenSearch && onOpenSearch()}>
          <div>
            <span>🔍</span>
          </div>
          <span>Tìm kiếm tin nhắn</span>
        </button>
        <button className="action-btn" onClick={() => window.location.assign('/settings')}>
          <div>
            <span>🎨</span>
          </div>
          <span>Giao diện thoại</span>
        </button>

      </div>

      <div className="media-section">
        <h4>Ảnh/Video</h4>
        <div className="media-grid">
          <div className="media-item"></div>
          <div className="media-item"></div>
          <div className="media-item"></div>
          <div className="media-item"></div>
        </div>
        <button className="view-all">Xem tất cả</button>
      </div>

      <div className="files-section">
        <h4>File</h4>
        <div className="file-list">
          <div className="file-item">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <div className="file-name">GrowNet.docx</div>
              <div className="file-meta">1.23 MB 📋</div>
            </div>
            <span className="file-date">04/10/2025</span>
          </div>
          <div className="file-item">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <div className="file-name">GrowNet_UI11.docx</div>
              <div className="file-meta">19.65 KB 📋</div>
            </div>
            <span className="file-date">03/10/2025</span>
          </div>
        </div>
        <button className="view-all">Xem tất cả</button>
      </div>

      <div className="links-section">
        <h4>Link</h4>
        <div className="link-list">
          <div className="link-item">
            <span className="link-icon">🔗</span>
            <div className="link-info">
              <div className="link-title">Meet</div>
              <div className="link-url">meet.google.com</div>
            </div>
            <span className="link-date">10/10</span>
          </div>
          <div className="link-item">
            <span className="link-icon">🔗</span>
            <div className="link-info">
              <div className="link-title">Meet</div>
              <div className="link-url">meet.google.com</div>
            </div>
            <span className="link-date">09/10</span>
          </div>
          <div className="link-item">
            <span className="link-icon">🔗</span>
            <div className="link-info">
              <div className="link-title">Gửi hàng</div>
              <div className="link-url">test.vn</div>
            </div>
            <span className="link-date">07/10</span>
          </div>
        </div>
        <button className="view-all">Xem tất cả</button>
      </div>
    </div>
  )
}
