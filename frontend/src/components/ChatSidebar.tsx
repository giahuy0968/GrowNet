import React, { useState } from 'react'
import { formatRelative } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import type { Chat } from '../services'
import '../styles/ChatSidebar.css'

interface ChatSidebarProps {
  chats: Chat[]
  loading: boolean
  error: string | null
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  onRefresh: () => void
}

export default function ChatSidebar({
  chats,
  loading,
  error,
  selectedChatId,
  onSelectChat,
  onRefresh
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()
  const { onlineUsers } = useSocket()

  const getParticipantDisplay = (chat: Chat) => {
    if (!chat.participants?.length) {
      return {
        name: chat.name || 'Cuộc trò chuyện'
      }
    }

    const participant = chat.participants.find(participant => {
      const participantId = typeof participant === 'string'
        ? participant
        : participant?._id || participant?.id
      return participantId !== user?._id
    }) || chat.participants[0]

    if (typeof participant === 'string') {
      return { name: participant }
    }

    return {
      name: participant.fullName || participant.username,
      avatar: participant.avatar,
      id: participant._id
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredChats = chats.filter(chat => {
    const { name } = getParticipantDisplay(chat)
    const matchesSearch = name.toLowerCase().includes(normalizedSearch)
    if (activeTab === 'unread') {
      const lastSender = chat.lastMessage?.senderId
      const lastSenderId = typeof lastSender === 'string'
        ? lastSender
        : lastSender?._id || lastSender?.id
      const isUnread = lastSenderId && lastSenderId !== user?._id
      return matchesSearch && isUnread
    }
    return matchesSearch
  })

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <input
          type="text"
          placeholder="Tìm kiếm cuộc trò chuyện..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="refresh-btn" onClick={onRefresh} aria-label="Làm mới danh sách">
          ↻
        </button>
      </div>

      <div className="chat-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
        <button
          className={activeTab === 'unread' ? 'active' : ''}
          onClick={() => setActiveTab('unread')}
        >
          Chưa đọc
        </button>
      </div>

      <div className="contacts-list">
        {loading && <p className="helper-text">Đang tải...</p>}
        {error && (
          <p className="helper-text error">
            {error}
            <button type="button" onClick={onRefresh}>Thử lại</button>
          </p>
        )}
        {!loading && !error && filteredChats.length === 0 && (
          <p className="helper-text">Không có cuộc trò chuyện phù hợp</p>
        )}

        {filteredChats.map(chat => {
          const { name, avatar, id } = getParticipantDisplay(chat)
          const lastMessage = chat.lastMessage?.content || 'Chưa có tin nhắn'
          const lastUpdated = chat.updatedAt
            ? formatRelative(new Date(chat.updatedAt), new Date(), { locale: vi })
            : ''
          const isOnline = id && onlineUsers.has(id)

          return (
            <button
              key={chat._id}
              className={`contact-item ${selectedChatId === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat._id)}
            >
              <div className="contact-avatar">
                <img src={avatar || '/user_avt.png'} alt={name} />
                {isOnline && <span className="status-indicator"></span>}
              </div>
              <div className="contact-info">
                <div className="contact-name">{name}</div>
                <div className="contact-message">{lastMessage}</div>
                <div className="contact-time">{lastUpdated}</div>
              </div>              
            </button>
          )
        })}
      </div>
    </div>
  )
}
