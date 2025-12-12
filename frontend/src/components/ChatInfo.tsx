// src/components/ChatInfo.tsx
import React, { useMemo, useState } from 'react'
import DeleteChatModal from './DeleteChatModal'
import ReportModal from './ReportModal'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import type { Chat } from '../services'
import '../styles/ChatInfo.css'

interface ChatInfoProps {
  chat: Chat | null;
  onOpenSearch?: () => void;
}

export default function ChatInfo({ chat, onOpenSearch }: ChatInfoProps) {
  const { user } = useAuth()
  const { onlineUsers } = useSocket()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const resolveUserId = (entity: any) => {
    if (!entity) return undefined
    if (typeof entity === 'string') return entity
    return entity._id || entity.id
  }

  const otherParticipant = useMemo(() => {
    if (!chat?.participants?.length) return null
    return chat.participants.find(participant => resolveUserId(participant) !== user?._id) || chat.participants[0]
  }, [chat, user?._id])

  if (!chat) return null

  const participantId = resolveUserId(otherParticipant)
  const participantName = typeof otherParticipant === 'string'
    ? otherParticipant
    : otherParticipant?.fullName || otherParticipant?.username || 'Người dùng'
  const participantAvatar = typeof otherParticipant === 'string'
    ? undefined
    : otherParticipant?.avatar
  const isOnline = participantId ? onlineUsers.has(participantId) : false

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleDelete = () => {
    // Logic xóa đoạn chat
    console.log('Xóa đoạn chat đã được xác nhận!')
    handleCloseModal()
  }

  const handleDeleteHistory = () => {
    handleOpenModal()
    setSettingsOpen(false)
    console.log('Delete chat history triggered for', participantName)
  }

  const handleReport = () => {
    // Mở modal báo cáo
    setIsReportOpen(true)
    setSettingsOpen(false)
    console.log('Report chat triggered for', participantName)
  }

  const handleCloseReport = () => {
    setIsReportOpen(false)
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
        <img src={participantAvatar || '/user_avt.png'} alt={participantName} className="profile-avatar" />
        <h4>{participantName}</h4>
        <p className="status">{isOnline ? '🟢 Đang hoạt động' : '⚪ Ngoại tuyến'}</p>
        {settingsOpen && (
          <div className="settings-menu" role="menu" aria-label="Tùy chọn cài đặt">
            <button 
              type="button" 
              className="settings-item danger"
              role="menuitem"
              onClick={handleDeleteHistory}
            >
              Xóa lịch sử trò chuyện
            </button>
            <button
              type="button"
              className="settings-item warn"
              role="menuitem"
              onClick={handleReport}
            >
              Báo cáo
            </button>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <button className="action-btn" onClick={() => window.location.assign('/profile')}>
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

      <DeleteChatModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        chatName={participantName}
      />
    </div>
  )
}
