import React, { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'
import notificationService, { type Notification as NotificationItem } from '../services/notification.service'
import '../styles/Notification.css'

type Tab = 'all' | 'unread'

export default function Notification() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        {items.map(notification => (
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
        ))}
      </div>
    )
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h2>Thông báo</h2>
        <div className="notification-actions">
          <button className="link-btn" onClick={handleMarkAll}>Đánh dấu tất cả đã đọc</button>
          <button className="link-btn" onClick={loadNotifications}>Làm mới</button>
        </div>
      </div>

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
