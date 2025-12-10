import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ChatWindow.css'
import { Icon } from './ui/Icon'

interface ChatWindowProps {
  chatName: string | null
}

export default function ChatWindow({ chatName }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const messages = [
    {
      sender: 'other',
      text: 'Bạn và Trần Văn B đã Match!!! 🎉 Bắt đầu trò chuyện và đặt lịch để kết nối vì chúng sẽ kết nối nghiệm.',
      isSystem: true
    },
    {
      sender: 'other',
      text: 'Chào Mentor, mình rất vì để Match với bạn. Mình đang muốn chuyển ngành sang Frontend Developer, bạn không biết bạn có cố vân cách để kết nối được không?'
    },
    {
      sender: 'me',
      text: 'Chào bạn, chắc chắn rồi! Bạn đang ở giai đoạn của quá trình chuyển đổi?'
    },
    {
      sender: 'other',
      text: 'Mình đã tự học được ReactJS cơ bản, nhưng cần tốt người hướng dẫn kế tối ưu hoá portfolio và tuyên bổ phòng vấn.'
    },
    {
      sender: 'me',
      text: 'Tuyệt vời! Bạn hãy gửi portfolio và CV qua đây mình. Sau đó mình sẽ đặt một buổi gặp online để xem xét qua.'
    }
  ]

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Send message
      setMessage('')
    }
  }

  if (!chatName) {
    return (
      <div className="chat-window empty">
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <img src="/avatar-tran.jpg" alt={chatName} className="chat-avatar" />
          <div>
            <h3>{chatName}</h3>
            <span className="online-status inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Đang hoạt động
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <button
            className="icon-btn"
            aria-label="Gọi điện"
            onClick={() => chatName && navigate(`/call/${encodeURIComponent(chatName)}`)}
          >
            <Icon name="phone" size="md" aria-hidden />
          </button>
          <button className="icon-btn" aria-label="Tìm kiếm">
            <Icon name="search" size="md" aria-hidden />
          </button>
          <button className="icon-btn" aria-label="Tùy chọn">
            <Icon name="more" size="md" aria-hidden />
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.isSystem ? 'system-message' : msg.sender === 'me' ? 'sent' : 'received'}`}
          >
            {!msg.isSystem && msg.sender === 'other' && (
              <img src="/avatar-tran.jpg" alt="" className="message-avatar" />
            )}
            <div className="message-bubble">
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <button className="icon-btn" aria-label="Đính kèm">
          <Icon name="attach" size="md" aria-hidden />
        </button>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="icon-btn" aria-label="Ghi chú">
          <Icon name="edit" size="md" aria-hidden />
        </button>
        <button className="send-btn" onClick={handleSend} aria-label="Gửi">
          <Icon name="send" size="md" aria-hidden />
        </button>
      </div>
    </div>
  )
}
