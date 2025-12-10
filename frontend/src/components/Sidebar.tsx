import React, { useState } from 'react'
import '../styles/Sidebar.css'
import { Icon } from './ui/Icon'

interface SidebarProps {
  onOpenFilter: () => void
}

export default function Sidebar({ onOpenFilter }: SidebarProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(['Design', 'Marketing'])
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['TypeScript', 'ReactJS'])
  const [selectedLocation, setSelectedLocation] = useState('TP HCM')
  const [experienceYears, setExperienceYears] = useState(3)

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Bộ lọc nhanh</h3>
          <button className="filter-icon" onClick={onOpenFilter} aria-label="Bộ lọc">
            <Icon name="settings" size="md" aria-hidden />
          </button>
        </div>

        <div className="filter-group">
          <h4>Lĩnh vực</h4>
          <div className="tag-list">
            {['Design', 'Marketing', 'UX/UI', 'TypeScript', 'ReactJS', 'Java'].map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Khu vực</h4>
          <div className="location-tabs">
            <button className={selectedLocation === 'TP HCM' ? 'active' : ''}>TP HCM</button>
            <button className={selectedLocation === 'Hà Nội' ? 'active' : ''}>Hà Nội</button>
            <button className={selectedLocation === 'Khác' ? 'active' : ''}>Khác...</button>
          </div>
        </div>
        <div className="filter-group">
          <h4>Kinh nghiệm (Năm)</h4>
          <input
            type="range"
            min="0"
            max="10"
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="experience-slider"
          />
          <span className="experience-value">{experienceYears}+</span>
        </div>
        <div className="filter-group">
          <h4>Trạng thái</h4>
          <button className="status-btn active">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Đang hoạt động
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
