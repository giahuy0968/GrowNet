import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { chatService, type Chat, type Message } from '../services'
import '../styles/ChatWindow.css'
import { Icon } from './ui/Icon'

interface ChatWindowProps {
  chat: Chat | null
  showSearch?: boolean
  onChatUpdated?: () => void
}

export default function ChatWindow({ chat, showSearch = false, onChatUpdated }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    if (!chat?._id) {
      setMessages([])
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    chatService.getMessages(chat._id)
      .then(({ messages }) => {
        if (isMounted) {
          setMessages(messages)
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || 'Không thể tải tin nhắn')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [chat?._id])

  useEffect(() => {
    if (!socket || !chat?._id) return

    socket.emit('chat:join', chat._id)

    const handleIncomingMessage = (payload: Message & { chatId?: string }) => {
      if (payload.chatId && payload.chatId !== chat._id) return
      setMessages(prev => {
        if (prev.some(existing => existing._id === payload._id)) {
          return prev
        }
        return [...prev, payload]
      })
    }

    socket.on('message:new', handleIncomingMessage)

    return () => {
      socket.off('message:new', handleIncomingMessage)
    }
  }, [socket, chat?._id])

  const resolveUserId = (entity: any) => {
    if (!entity) return undefined
    if (typeof entity === 'string') return entity
    return entity._id || entity.id
  }

  const filteredMessages = useMemo(() => {
    if (!showSearch || !searchTerm.trim()) return messages
    const normalized = searchTerm.toLowerCase()
    return messages.filter(msg => msg.content?.toLowerCase().includes(normalized))
  }, [messages, searchTerm, showSearch])

  const activeParticipant = useMemo(() => {
    if (!chat?.participants) return null
    return chat.participants.find(participant => resolveUserId(participant) !== user?._id) || chat.participants[0]
  }, [chat?.participants, user?._id])

  const participantName = typeof activeParticipant === 'string'
    ? activeParticipant
    : activeParticipant?.fullName || activeParticipant?.username || 'Người dùng'

  const participantAvatar = typeof activeParticipant === 'string'
    ? undefined
    : activeParticipant?.avatar

  const handleSend = async () => {
    if (!chat?._id || !messageText.trim() || sending) return

    setSending(true)
    setError(null)

    try {
      const newMessage = await chatService.sendMessage(chat._id, { content: messageText.trim() })
      setMessages(prev => [...prev, newMessage])
      setMessageText('')
      socket?.emit('message:send', { ...newMessage, chatId: chat._id })
      onChatUpdated?.()
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  if (!chat) {
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
          <img src={participantAvatar || '/user_avt.png'} alt={participantName} className="chat-avatar" />
          <div>
            <h3>{participantName}</h3>
            <span className="last-seen">
              Cập nhật lần cuối {chat.updatedAt ? format(new Date(chat.updatedAt), 'HH:mm dd/MM', { locale: vi }) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <button
            className="icon-btn"
            aria-label="Gọi điện"
            onClick={() => participantName && navigate(`/call/${encodeURIComponent(participantName)}`)}
          >
            <Icon name="phone" size="md" aria-hidden />
          </button>
          {!showSearch && (
            <button className="icon-btn" aria-label="Tìm kiếm">
              <Icon name="search" size="md" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="chat-search-bar" role="search" aria-label="Tìm kiếm tin nhắn">
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn trong cuộc hội thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="messages-container">
        {loading && <p className="helper-text">Đang tải tin nhắn...</p>}
        {error && <p className="helper-text error">{error}</p>}
        {!loading && !error && filteredMessages.length === 0 && (
          <p className="helper-text">Chưa có tin nhắn nào trong cuộc trò chuyện này</p>
        )}

        {filteredMessages.map(message => {
          const senderId = resolveUserId(message.senderId)
          // Log để kiểm tra giá trị userId và senderId
          console.log('Current userId:', user?._id, 'Message senderId:', senderId)
          // Đảm bảo so sánh cùng kiểu dữ liệu (string)
          const isOwnMessage = senderId?.toString() === user?._id?.toString()
          const timestamp = message.createdAt
            ? format(new Date(message.createdAt), 'HH:mm', { locale: vi })
            : ''

          return (
            <div
              key={message._id}
              className={`message ${isOwnMessage ? 'sent' : 'received'}`}
            >
              {!isOwnMessage && (
                <img src={participantAvatar || '/user_avt.png'} alt="" className="message-avatar" />
              )}
              <div className="message-bubble">
                <p>{message.content}</p>
                <span className="message-time">{timestamp}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="chat-input-container">
        <button className="icon-btn" aria-label="Đính kèm">
          <Icon name="attach" size="md" aria-hidden />
        </button>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <button className="icon-btn" aria-label="Ghi chú">
          <Icon name="edit" size="md" aria-hidden />
        </button>
        <button className="send-btn" onClick={handleSend} aria-label="Gửi" disabled={sending}>
          <Icon name="send" size="md" aria-hidden />
        </button>
      </div>
    </div>
  )
}
