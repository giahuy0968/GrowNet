import React, { useState, useRef, useEffect, useCallback, useMemo, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import '../styles/Header.css'
import { Icon } from './ui/Icon'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import notificationService from '../services/notification.service'


interface HeaderProps {
  onOpenFilter?: () => void
}

export default function Header({ onOpenFilter }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const [showNotification, setShowNotification] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchValue(params.get('search') || '')
  }, [location.search])


  const navItems = useMemo(() => {
    const items: { label: string; to: string; match: string }[] = [
      { label: 'Dashboard', to: '/dashboard', match: '/dashboard' }
    ]

    if (user?.role === 'mentor' || user?.role === 'admin' || user?.role === 'moderator') {
      items.push({ label: 'Học viện Mentor', to: '/mentor-academy', match: '/mentor-academy' })
      items.push({ label: 'Social', to: '/social', match: '/social' })
    } else if (user) {
      items.push({ label: 'Social', to: '/social', match: '/social' })
    }

    if (user?.role === 'mentee') {
      items.push({ label: 'Khoá học cho bạn', to: '/courses', match: '/courses' })
    }

    if (user?.role === 'admin' || user?.role === 'moderator') {
      items.push({ label: 'Quản trị tài khoản', to: '/admin/users', match: '/admin' })
    }

    return items
  }, [user?.role])

  const handleOpenChat = () => {
    navigate('/chat')
  }
  const handleToggleNotification = () => {
    setShowNotification((prev) => !prev)
  }
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const handleToggleDropdown = () => {
    setShowDropdown(prev => !prev)
  }

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { unreadCount } = await notificationService.getNotifications(1)
        setUnreadCount(unreadCount)
      } catch (error) {
        console.error('Không thể tải số lượng thông báo chưa đọc:', error)
      }
    }

    fetchUnreadCount()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleIncoming = () => {
      setUnreadCount(prev => prev + 1)
    }

    socket.on('notification:new', handleIncoming)
    return () => {
      socket.off('notification:new', handleIncoming)
    }
  }, [socket])

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

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
        handleLogout()
        break
      default:
        break
    }
  }

  const handleSearchSubmit = (event?: FormEvent) => {
    event?.preventDefault()
    const query = searchValue.trim()
    const target = query ? `/dashboard?search=${encodeURIComponent(query)}` : '/dashboard'
    if (location.pathname === '/dashboard' && location.search === (query ? `?search=${encodeURIComponent(query)}` : '')) {
      return
    }
    navigate(target)
  }

  return (
    <header className="dashboard-header">
      <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <img src="/GrowNet_icon.png" alt="GrowNet" />
        <span>GrowNet</span>
      </div>

      <div className="header-center">
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm mentor, kỹ năng hoặc lĩnh vực..."
            value={searchValue}
            onChange={event => setSearchValue(event.target.value)}
          />
          <button className="search-btn" type="submit" aria-label="Tìm kiếm">
            <Icon name="search" size="md" aria-hidden />
          </button>
        </form>
        {navItems.length > 0 && (
          <nav className="header-nav" aria-label="Điều hướng nhanh">
            <div className="header-nav__list">
              {navItems.map(item => {
                const isActive = location.pathname.startsWith(item.match)
                return (
                  <button
                    key={item.to}
                    type="button"
                    className={`header-nav__item ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => navigate(item.to)}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span layoutId="nav-underline" className="header-nav__underline" />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>

      <div className="header-actions">
        <button className="icon-btn" onClick={handleOpenChat} aria-label="Chat">
          <Icon name="chat" size="md" aria-hidden />
        </button>

        <button className="icon-btn notification-btn" onClick={handleToggleNotification} aria-label="Thông báo">
          <Icon name="bell" size="md" aria-hidden />
          {unreadCount > 0 && (
            <span className="notification-indicator" aria-label={`Có ${unreadCount} thông báo mới`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <div className="user-avatar" ref={dropdownRef}>
          <img
            src={user?.avatar || '/user_avt.png'}
            alt={user?.fullName || 'User'}
            onClick={handleToggleDropdown}
          />
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
              <Notification onUnreadCountChange={handleUnreadCountChange} />
            </div>
          </div>
        ),
        document.body
      )}
    </header>
  )
}
