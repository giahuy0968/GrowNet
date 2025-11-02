import React from 'react'
import '../styles/Header.css'

interface HeaderProps {
  onOpenFilter?: () => void
}

export default function Header({ onOpenFilter }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="header-logo">
        <img src="/GrowNet_icon.png" alt="GrowNet" />
        <span>GrowNet</span>
      </div>

      <div className="header-search">
        <input type="text" placeholder="Tìm mentor, kỹ năng hoặc lĩnh vực..." />
        <button className="search-btn">🔍</button>
      </div>

      <div className="header-actions">
        <button className="icon-btn">💬</button>
        <button className="icon-btn">🔔</button>
        <div className="user-avatar">
          <img src="/user-avatar.jpg" alt="User" />
        </div>
      </div>
    </header>
  )
}
