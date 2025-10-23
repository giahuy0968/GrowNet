import React, { useState } from 'react'
import '../styles/ChatSidebar.css'

interface ChatSidebarProps {
  selectedChat: string | null
  onSelectChat: (name: string) => void
}

export default function ChatSidebar({ selectedChat, onSelectChat }: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'unread'>('all')
  
  const contacts = [
    { name: 'Trần Văn B', message: 'Tuyệt vời, khi nào chúng ta có thể...', status: 'online', time: '10:30' },
    { name: 'Nguyễn Thị C', message: 'Mình có thể gửi CV không?', status: 'offline', time: '10:30' },
    { name: 'Lê Minh D', message: '', status: 'offline', time: '1 tuần' },
    { name: 'Phạm Văn E', message: 'Mình sẽ gửi cho bạn tài liệu', status: 'offline', time: '1 tuần trước' }
  ]

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <input type="text" placeholder="Tìm kiếm chuyện..." className="search-input" />
      </div>

      <div className="chat-tabs">
        <button 
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
        <button 
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Yêu Cầu (3)
        </button>
        <button 
          className={activeTab === 'unread' ? 'active' : ''}
          onClick={() => setActiveTab('unread')}
        >
          Chưa đọc (2)
        </button>
      </div>

      <div className="contacts-list">
        {contacts.map(contact => (
          <div 
            key={contact.name}
            className={`contact-item ${selectedChat === contact.name ? 'active' : ''}`}
            onClick={() => onSelectChat(contact.name)}
          >
            <div className="contact-avatar">
              <img src={`/avatar-${contact.name.split(' ')[0]}.jpg`} alt={contact.name} />
              {contact.status === 'online' && <span className="status-indicator"></span>}
            </div>
            <div className="contact-info">
              <div className="contact-name">{contact.name}</div>
              <div className="contact-message">{contact.message}</div>
            </div>
            <div className="contact-time">{contact.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
