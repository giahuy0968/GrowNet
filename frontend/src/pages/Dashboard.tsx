import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ProfileCard from '../components/ProfileCard'
import Calendar from '../components/Calendar'
import FilterModal from '../components/FilterModal'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const [showFilterModal, setShowFilterModal] = useState(false)

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-logo">
          <img src="/logo.svg" alt="GrowNet" />
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

      <div className="dashboard-content">
        <Sidebar onOpenFilter={() => setShowFilterModal(true)} />
        
        <main className="main-content">
          <ProfileCard />
        </main>

        <aside className="right-sidebar">
          <Calendar />
        </aside>
      </div>

      {showFilterModal && (
        <FilterModal onClose={() => setShowFilterModal(false)} />
      )}
    </div>
  )
}
