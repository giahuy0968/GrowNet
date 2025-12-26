import React, { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import notificationService, { type Notification as NotificationItem } from '../services/notification.service'
import { connectionService } from '../services'
import type { Connection, ConnectionMatchResult } from '../services/connection.service'
import { useSocket } from '../contexts/SocketContext'
import '../styles/Notification.css'

type Tab = 'all' | 'unread'

interface NotificationProps {
  onUnreadCountChange?: (count: number) => void
  onClose?: () => void
}

export default function Notification({ onUnreadCountChange, onClose }: NotificationProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [processingAction, setProcessingAction] = useState<{ connectionId: string; type: 'accept' | 'reject' } | null>(null)
  const { socket } = useSocket()
  const navigate = useNavigate()

  const loadNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const { notifications: data } = await notificationService.getNotifications()
      setNotifications(data)
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadPendingRequests = async () => {
    setLoadingRequests(true)
    try {
      const { requests } = await connectionService.getPendingRequests()
      setPendingRequests(requests)
    } catch (err: any) {
      setError(err?.message || 'Không thể tải lời mời kết nối')
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    loadPendingRequests()
  }, [])

  useEffect(() => {
    if (!onUnreadCountChange) return
    const unread = notifications.filter(notification => !notification.read).length
    onUnreadCountChange(unread)
  }, [notifications, onUnreadCountChange])

  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (payload: NotificationItem) => {
      setNotifications(prev => {
        const exists = prev.some(notification => notification._id === payload._id)
        if (exists) {
          return prev
        }
        return [payload, ...prev]
      })
    }

    socket.on('notification:new', handleNewNotification)
    return () => {
      socket.off('notification:new', handleNewNotification)
    }
  }, [socket])

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications
    return notifications.filter(notification => !notification.read)
  }, [notifications, activeTab])

  const sections = useMemo(() => {
    const today: NotificationItem[] = []
    const yesterday: NotificationItem[] = []
    const earlier: NotificationItem[] = []

    filteredNotifications.forEach(notification => {
      const createdDate = new Date(notification.createdAt)
      if (isToday(createdDate)) {
        today.push(notification)
      } else if (isYesterday(createdDate)) {
        yesterday.push(notification)
      } else {
        earlier.push(notification)
      }
    })

    return { today, yesterday, earlier }
  }, [filteredNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(notification => notification._id === id ? { ...notification, read: true } : notification))
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật thông báo')
    }
  }

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
    } catch (err: any) {
      setError(err?.message || 'Không thể đánh dấu tất cả đã đọc')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(notification => notification._id !== id))
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa thông báo')
    }
  }

  const isActionableConnection = (notification: NotificationItem) =>
    notification.type === 'connection' && Boolean(notification.relatedId) && /sent you a connection request/i.test(notification.message)

  const processConnectionAction = async (
    connectionId: string,
    action: 'accept' | 'reject',
    notificationId?: string
  ) => {
    setProcessingAction({ connectionId, type: action })
    try {
      let result: ConnectionMatchResult | null = null
      if (action === 'accept') {
        result = await connectionService.acceptRequest(connectionId)
      } else {
        await connectionService.rejectRequest(connectionId)
      }

      if (notificationId) {
        await notificationService.deleteNotification(notificationId)
        setNotifications(prev => prev.filter(item => item._id !== notificationId))
      }

      setPendingRequests(prev => prev.filter(request => request._id !== connectionId))

      if (action === 'accept' && result?.chat?._id) {
        navigate('/chat', { state: { chatId: result.chat._id } })
        onClose?.()
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể xử lý lời mời kết nối')
    } finally {
      setProcessingAction(null)
    }
  }

  const isProcessing = (connectionId: string, type: 'accept' | 'reject') =>
    processingAction?.connectionId === connectionId && processingAction?.type === type

  const renderPendingRequests = () => {
    return (
      <div className="pending-requests">
        <div className="pending-header">
          <div>
            <h3>Lời mời kết nối</h3>
            <p>Những mentor/mentee đang đợi phản hồi của bạn</p>
          </div>
          <button className="link-btn" onClick={loadPendingRequests}>Làm mới</button>
        </div>
        {loadingRequests ? (
          <p className="helper-text compact">Đang tải lời mời...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="helper-text compact">Chưa có lời mời nào</p>
        ) : (
          pendingRequests.map(connection => {
            const sender = typeof connection.userId1 === 'string' ? null : connection.userId1
            const name = sender?.fullName || sender?.username || 'Thành viên GrowNet'
            const title = sender?.jobTitle || sender?.role || 'GrowNet member'
            const location = sender?.location
              ? [sender.location.city, sender.location.country].filter(Boolean).join(', ')
              : ''

            return (
              <div key={connection._id} className="pending-card">
                <div className="pending-info">
                  <img src={sender?.avatar || '/user_avt.png'} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{title}</span>
                    {location && <small>{location}</small>}
                  </div>
                </div>
                <div className="pending-actions">
                  <button
                    className="notif-connect-btn primary"
                    onClick={() => processConnectionAction(connection._id, 'accept')}
                    disabled={isProcessing(connection._id, 'accept')}
                  >
                    {isProcessing(connection._id, 'accept') ? 'Đang chấp nhận...' : 'Chấp nhận'}
                  </button>
                  <button
                    className="notif-connect-btn"
                    onClick={() => processConnectionAction(connection._id, 'reject')}
                    disabled={isProcessing(connection._id, 'reject')}
                  >
                    {isProcessing(connection._id, 'reject') ? 'Đang từ chối...' : 'Từ chối'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  const renderSection = (title: string, items: NotificationItem[]) => {
    if (items.length === 0) return null
    return (
      <div className="notification-section">
        <div className="section-header">
          <h3>{title}</h3>
        </div>
        {items.map(notification => {
          const actionable = isActionableConnection(notification)
          return (
            <div key={notification._id} className={`notification-item ${notification.read ? '' : 'unread'}`}>
              {!notification.read && <span className="unread-dot">•</span>}
              <img src="/GrowNet_icon.png" alt="" className="notif-avatar" />
              <div className="notif-content">
                <p>
                  <strong>{notification.type.toUpperCase()}</strong> {notification.message}
                </p>
                <span className="notif-time">{formatTimeAgo(notification.createdAt)}</span>
              </div>
              <div className="notif-actions">
                {actionable && (
                  <div className="notif-connect-actions">
                    <button
                      className="notif-connect-btn primary"
                      onClick={() => notification.relatedId && processConnectionAction(notification.relatedId, 'accept', notification._id)}
                      disabled={!notification.relatedId || isProcessing(notification.relatedId, 'accept')}
                    >
                      {notification.relatedId && isProcessing(notification.relatedId, 'accept') ? 'Đang chấp nhận...' : 'Chấp nhận'}
                    </button>
                    <button
                      className="notif-connect-btn"
                      onClick={() => notification.relatedId && processConnectionAction(notification.relatedId, 'reject', notification._id)}
                      disabled={!notification.relatedId || isProcessing(notification.relatedId, 'reject')}
                    >
                      {notification.relatedId && isProcessing(notification.relatedId, 'reject') ? 'Đang từ chối...' : 'Từ chối'}
                    </button>
                  </div>
                )}
                <div className="notif-secondary-actions">
                  {!notification.read && (
                    <button className="notif-action" onClick={() => handleMarkAsRead(notification._id)}>
                      ✅
                    </button>
                  )}
                  <button className="notif-action" onClick={() => handleDelete(notification._id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h2>Thông báo</h2>

      </div>

      {renderPendingRequests()}

      <div className="notification-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          TẤT CẢ
        </button>
        <button
          className={activeTab === 'unread' ? 'active' : ''}
          onClick={() => setActiveTab('unread')}
        >
          CHƯA XEM
        </button>
      </div>
      <div className="notification-actions">
        <button className="link-btn" onClick={handleMarkAll}>Đánh dấu tất cả đã đọc</button>
        <button className="link-btn" onClick={loadNotifications}>Làm mới</button>
      </div>

      <div className="notification-list">
        {loading && <p className="helper-text">Đang tải thông báo...</p>}
        {error && <p className="helper-text error">{error}</p>}
        {!loading && !error && filteredNotifications.length === 0 && (
          <p className="helper-text">Không có thông báo nào</p>
        )}

        {renderSection('HÔM NAY', sections.today)}
        {renderSection('HÔM QUA', sections.yesterday)}
        {renderSection('TRƯỚC ĐÓ', sections.earlier)}
      </div>
    </div>
  )
}
