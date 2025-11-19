import React, { useState } from 'react'
import '../styles/Notification.css'

export default function Notification() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  const notifications = {
    today: [
      {
        avatar: '/avatar.jpg',
        name: 'Minh Anh',
        action: 'đã gửi cho bạn lời mời kết nối 🎉',
        time: '5 phút trước'
      },
      {
        avatar: '/avatar-system.jpg',
        name: 'Hệ thống GrowNet',
        action: 'nhắc bạn cập nhật kỹ năng mới để tăng khả năng gợi ý mentor ✨',
        time: '2 giờ trước'
      }
    ],
    yesterday: [
      {
        avatar: '/avatar-long.jpg',
        name: 'Long Nguyễn',
        action: 'đã phản hồi tin nhắn của bạn 💬',
        time: '1 ngày trước'
      },
      {
        avatar: '/avatar-system.jpg',
        name: 'Bạn có 3 gợi ý mentor mới',
        action: 'dựa trên kỹ năng "Thiết kế UX/UI" 💡',
        time: '1 ngày trước'
      }
    ],
    earlier: [
      {
        avatar: '/avatar-system.jpg',
        name: 'Khóa học "Kỹ năng giao tiếp"',
        action: 'đã sẵn sàng cho bạn xem lại 🎓',
        time: '3 ngày trước'
      },
      {
        avatar: '/avatar-system.jpg',
        name: 'Khóa học "Kỹ năng thuyết trình"',
        action: 'đã sẵn sàng cho bạn xem lại 🎓',
        time: '3 ngày trước'
      }
    ]
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h2>Thông báo</h2>
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
        <div className="notification-section">
          <div className="section-header">
            <h3>HÔM NAY</h3>
            <button className="link-btn">XEM TẤT CẢ</button>
          </div>
          {notifications.today.map((notif, index) => (
            <div key={index} className="notification-item">
              <span className="unread-dot">•</span>
              <img src={notif.avatar} alt="" className="notif-avatar" />
              <div className="notif-content">
                <p><strong>{notif.name}</strong> {notif.action}</p>
                <span className="notif-time">{notif.time}</span>
              </div>
              <button className="notif-action">📌</button>
            </div>
          ))}
        </div>

        <div className="notification-section">
          <h3>HÔM QUA</h3>
          {notifications.yesterday.map((notif, index) => (
            <div key={index} className="notification-item">
              <span className="unread-dot">•</span>
              <img src={notif.avatar} alt="" className="notif-avatar" />
              <div className="notif-content">
                <p><strong>{notif.name}</strong> {notif.action}</p>
                <span className="notif-time">{notif.time}</span>
              </div>
              <button className="notif-action">📍</button>
            </div>
          ))}
        </div>

        <div className="notification-section">
          <h3>TRƯỚC ĐÓ</h3>
          {notifications.earlier.map((notif, index) => (
            <div key={index} className="notification-item">
              <img src={notif.avatar} alt="" className="notif-avatar" />
              <div className="notif-content">
                <p><strong>{notif.name}</strong> {notif.action}</p>
                <span className="notif-time">{notif.time}</span>
              </div>
              <button className="notif-action">📍</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
