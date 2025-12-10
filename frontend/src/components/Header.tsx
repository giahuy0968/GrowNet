import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import '../styles/Header.css'
import { Icon } from './ui/Icon'


interface HeaderProps {
  onOpenFilter?: () => void
}

export default function Header({ onOpenFilter }: HeaderProps) {
  const navigate = useNavigate()
  const [showNotification, setShowNotification] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const handleOpenChat = () => {
    navigate('/chat')
  }
  const handleToggleNotification = () => {
    setShowNotification((prev) => !prev)
  }
  const handleToggleDropdown = () => {
    setShowDropdown(prev => !prev)
  }

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Xử lý khi chọn mục trong dropdown
  const handleSelect = (option: string) => {
    setShowDropdown(false)
    switch (option) {
      case 'profile':
        navigate('/profile') // Bạn có thể tạo trang này sau
        break
      case 'settings':
        navigate('/settings') // hoặc mở modal cài đặt
        break
      case 'logout':
        navigate('/login') // hoặc gọi API logout
        break
      default:
        break
    }
  }

  return (
    <header className="dashboard-header">
      <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <img src="/GrowNet_icon.png" alt="GrowNet" />
        <span>GrowNet</span>
      </div>


      <div className="header-search">
        <input type="text" placeholder="Tìm mentor, kỹ năng hoặc lĩnh vực..." />
        <button className="search-btn" aria-label="Tìm kiếm">
          <Icon name="search" size="md" aria-hidden />
        </button>
      </div>

      <div className="header-actions">
        <button className="icon-btn" onClick={handleOpenChat} aria-label="Chat">
          <Icon name="chat" size="md" aria-hidden />
        </button>

        <button className="icon-btn" onClick={handleToggleNotification} aria-label="Thông báo">
          <Icon name="bell" size="md" aria-hidden />
        </button>
        <div className="user-avatar" ref={dropdownRef}>
          <img src="/user_avt.png" alt="User" onClick={handleToggleDropdown} />
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/my-profile")}>
                <Icon name="user" size="md" className="mr-2" aria-hidden /> Thông tin cá nhân
              </button>
              <button onClick={() => handleSelect('settings')}>
                <Icon name="settings" size="md" className="mr-2" aria-hidden /> Cài đặt
              </button>
              <button onClick={() => handleSelect('logout')}>
                <Icon name="logout" size="md" className="mr-2" aria-hidden /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
      {showNotification && createPortal(
        (
          <div
            className="notification-overlay"
            onClick={() => setShowNotification(false)}
          >
            <div
              className="notification-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <Notification />
            </div>
          </div>
        ),
        document.body
      )}
    </header>
  )
}
