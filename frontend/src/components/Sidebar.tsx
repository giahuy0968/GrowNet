import React from 'react'
import '../styles/Sidebar.css'
import { Icon } from './ui/Icon'

const FIELD_OPTIONS = ['Design', 'Marketing', 'UX/UI', 'TypeScript', 'ReactJS', 'Java']

interface SidebarProps {
  onOpenFilter: () => void
  selectedFields: string[]
  selectedLocation: string
  experienceYears: number
  onToggleField: (field: string) => void
  onSelectLocation: (location: string) => void
  onExperienceChange: (value: number) => void
}

export default function Sidebar({
  onOpenFilter,
  selectedFields,
  selectedLocation,
  experienceYears,
  onToggleField,
  onSelectLocation,
  onExperienceChange
}: SidebarProps) {
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
            {FIELD_OPTIONS.map(tag => {
              const active = selectedFields.includes(tag)
              return (
                <button
                  type="button"
                  key={tag}
                  className={`tag ${active ? 'active' : ''}`}
                  aria-pressed={active}
                  onClick={() => onToggleField(tag)}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="filter-group">
          <h4>Khu vực</h4>
          <div className="location-tabs">
            <button
              type="button"
              className={selectedLocation === 'TP HCM' ? 'active' : ''}
              onClick={() => onSelectLocation('TP HCM')}
            >TP HCM</button>
            <button
              type="button"
              className={selectedLocation === 'Hà Nội' ? 'active' : ''}
              onClick={() => onSelectLocation('Hà Nội')}
            >Hà Nội</button>
            <button
              type="button"
              className={selectedLocation === 'Khác' ? 'active' : ''}
              onClick={() => onSelectLocation('Khác')}
            >Khác...</button>
          </div>
        </div>
        <div className="filter-group">
          <h4>Kinh nghiệm (Năm)</h4>
          <input
            type="range"
            min="0"
            max="10"
            value={experienceYears}
            onChange={(e) => onExperienceChange(Number(e.target.value))}
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
