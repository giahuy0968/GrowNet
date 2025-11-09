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
